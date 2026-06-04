import { useMemo } from "react";
import {
  AlertTriangle,
  Bus,
  ClipboardCheck,
  MapPin,
  Route as RouteIcon,
  Truck,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  Panel,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { fullName } from "@/lib/format";
import { useAuthStore } from "@/store/auth";

export function DriverDashboard() {
  const user = useAuthStore((s) => s.user);

  const data = useMemo(() => {
    const staff = user?.linkedProfileId
      ? db.getById("staff", user.linkedProfileId)
      : null;

    const route = staff?.assignedRouteId
      ? db.getById("routes", staff.assignedRouteId)
      : db.query("routes", (r) => r.vehicleId === staff?.assignedVehicleId)[0] ?? null;

    const vehicle = route ? db.getById("vehicles", route.vehicleId) : null;
    const assigned = route ? db.query("tripAssignments", (t) => t.routeId === route.id) : [];
    const trip = route ? db.query("trips", (t) => t.routeId === route.id)[0] ?? null : null;

    // My Route — stops in sequence order.
    const routeStops = (route?.stopIds ?? [])
      .flatMap((id) => {
        const s = db.getById("stops", id);
        return s ? [s] : [];
      })
      .sort((a, b) => a.sequence - b.sequence);

    const routeItems: ListItem[] = routeStops.map((s) => ({
      id: s.id,
      title: s.name,
      subtitle: `Pickup ${s.pickupTime}`,
    }));

    // Assigned students.
    const studentItems: ListItem[] = assigned.flatMap((a) => {
      const student = db.getById("students", a.studentId);
      if (!student) return [];
      const cls = db.getById("classes", student.classId);
      const item: ListItem = {
        id: a.id,
        title: fullName(student.firstName, student.lastName),
        subtitle: cls?.name ?? "—",
        avatar: { first: student.firstName, last: student.lastName },
      };
      return [item];
    });

    // Recent incidents for my vehicle.
    const incidentItems: ListItem[] = (
      vehicle ? db.query("incidents", (i) => i.vehicleId === vehicle.id) : []
    )
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((i) => ({
        id: i.id,
        title: i.type,
        subtitle: i.description,
        badge: {
          label: i.severity,
          variant:
            i.severity === "high"
              ? ("destructive" as const)
              : i.severity === "medium"
                ? ("warning" as const)
                : ("secondary" as const),
        },
      }));

    return {
      staff,
      route,
      vehicle,
      assignedCount: assigned.length,
      present: trip?.presentCount ?? 0,
      absent: trip?.absentCount ?? 0,
      tripStatus: trip?.status ?? "scheduled",
      routeItems,
      studentItems,
      incidentItems,
    };
  }, [user]);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Live Tracking", icon: MapPin, to: areaRoute("tracking"), tone: "accent" },
              { label: "Pickup/Drop", icon: Users, to: areaRoute("pickup-drop") },
              { label: "Report Incident", icon: AlertTriangle, to: areaRoute("incidents") },
              { label: "Vehicle Checklist", icon: ClipboardCheck, to: areaRoute("vehicle") },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          { label: "Students Assigned", value: data.assignedCount, icon: Users, tone: "primary" },
          { label: "Present", value: data.present, icon: UserCheck, tone: "success" },
          { label: "Absent", value: data.absent, icon: UserX, tone: "danger" },
          { label: "Trip Status", value: data.tripStatus, icon: Bus, tone: "info" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="My Route"
            icon={RouteIcon}
            items={data.routeItems}
            emptyText="No route assigned yet"
            viewAllTo={areaRoute("tracking")}
            max={8}
          />
        </div>
        <ListCard
          title="Assigned Students"
          icon={Users}
          items={data.studentItems}
          emptyText="No students assigned"
          viewAllTo={areaRoute("pickup-drop")}
          max={8}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Recent Incidents"
            icon={AlertTriangle}
            items={data.incidentItems}
            emptyText="No incidents reported"
            viewAllTo={areaRoute("incidents")}
          />
        </div>
        <Panel title="Vehicle" icon={Truck}>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold tracking-tight">
                {data.vehicle?.vehicleNo ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.route?.name ?? "No route assigned"}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to={areaRoute("vehicle")}>
                <ClipboardCheck className="size-4" /> Vehicle Checklist
              </Link>
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
