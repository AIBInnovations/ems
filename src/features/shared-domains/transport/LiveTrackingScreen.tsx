import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, Bus, Gauge, MapPin, Pause, Play } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { transportService } from "@/data/services";
import { cn } from "@/lib/utils";

type LatLng = [number, number];

function Recenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom(), { animate: true }); }, [center, map]);
  return null;
}

export function LiveTrackingScreen() {
  const routes = db.getAll("routes");
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  const route = db.getById("routes", routeId);
  const stops = useMemo(
    () => (route ? route.stopIds.map((id) => db.getById("stops", id)).filter(Boolean).sort((a, b) => a!.sequence - b!.sequence) : []),
    [routeId], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const path: LatLng[] = stops.map((s) => [s!.lat, s!.lng]);

  const [running, setRunning] = useState(true);
  const [progress, setProgress] = useState(0); // 0..(path.length-1)
  const [speed, setSpeed] = useState(42);
  const alertedRef = useRef(false);
  const limit = route?.speedLimitKmph ?? 80;
  const overSpeed = speed > limit;

  useEffect(() => { setProgress(0); alertedRef.current = false; }, [routeId]);

  useEffect(() => {
    if (!running || path.length < 2) return;
    const t = setInterval(() => {
      setProgress((p) => (p + 0.06 >= path.length - 1 ? 0 : p + 0.06));
      // pseudo-random speed: base + wave, with occasional spikes above the limit
      setSpeed(() => {
        const base = 38 + Math.sin(Date.now() / 1400) * 14;
        const spike = Math.random() < 0.12 ? 35 + Math.random() * 15 : 0;
        return Math.round(base + spike);
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, path.length]);

  useEffect(() => {
    if (overSpeed && !alertedRef.current && route) {
      alertedRef.current = true;
      void transportService.raiseSpeedAlert(route.id, speed, limit);
      toast.warning(`Over-speed: ${speed} km/h (limit ${limit}) — parents & admin alerted`);
      setTimeout(() => { alertedRef.current = false; }, 6000);
    }
  }, [overSpeed, speed, limit, route]);

  const i = Math.floor(progress);
  const frac = progress - i;
  const busPos: LatLng = path.length >= 2
    ? [path[i][0] + (path[i + 1][0] - path[i][0]) * frac, path[i][1] + (path[i + 1][1] - path[i][1]) * frac]
    : path[0] ?? [23.25, 77.41];

  const vehicle = route ? db.getById("vehicles", route.vehicleId) : null;
  const driver = vehicle?.driverStaffId ? db.getById("staff", vehicle.driverStaffId) : null;
  const studentCount = route ? db.query("tripAssignments", (t) => t.routeId === route.id).length : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Bus Tracking"
        icon={<Bus className="size-5" />}
        description="Real-time route, location, speed and over-speed alerts."
        actions={<DemoBadge />}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={routeId} onValueChange={setRouteId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Route" /></SelectTrigger>
          <SelectContent>{routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setRunning((r) => !r)}>{running ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Resume</>}</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="h-[420px] w-full">
            {path.length >= 2 ? (
              <MapContainer center={busPos} zoom={14} className="h-full w-full" scrollWheelZoom>
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={path} pathOptions={{ color: "#2f43c4", weight: 4, opacity: 0.7 }} />
                {stops.map((s) => (
                  <CircleMarker key={s!.id} center={[s!.lat, s!.lng]} radius={6} pathOptions={{ color: "#0f766e", fillColor: "#0f766e", fillOpacity: 1 }}>
                    <Tooltip>{s!.name} · {s!.pickupTime}</Tooltip>
                  </CircleMarker>
                ))}
                <CircleMarker center={busPos} radius={11} pathOptions={{ color: "#fff", weight: 3, fillColor: overSpeed ? "#dc2626" : "#2f43c4", fillOpacity: 1 }}>
                  <Tooltip permanent direction="top">🚌 {speed} km/h</Tooltip>
                </CircleMarker>
                <Recenter center={busPos} />
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No stops on this route.</div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          {overSpeed ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              <AlertTriangle className="size-5 shrink-0" /> Over-speed alert — {speed} km/h (limit {limit})
            </div>
          ) : null}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Speed</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <Gauge className={cn("size-6", overSpeed ? "text-destructive" : "text-success")} />
                <span className={cn("font-display text-4xl font-bold tabular-nums", overSpeed ? "text-destructive" : "")}>{speed}</span>
                <span className="mb-1 text-sm text-muted-foreground">km/h · limit {limit}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-all", overSpeed ? "bg-destructive" : "bg-success")} style={{ width: `${Math.min(100, (speed / (limit * 1.3)) * 100)}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Trip details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Vehicle</span><span className="font-mono">{vehicle?.vehicleNo ?? "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Driver</span><span>{driver ? `${driver.firstName} ${driver.lastName}` : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Students</span><Badge variant="secondary">{studentCount}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Next stop</span><span className="flex items-center gap-1"><MapPin className="size-3.5 text-teal-600" />{stops[Math.min(i + 1, stops.length - 1)]?.name ?? "—"}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
