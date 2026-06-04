import { useMemo } from "react";
import { CalendarCheck, CalendarDays, Trophy, UserCheck, Users } from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";

export function SportsDashboard() {
  const data = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const activities = db.getAll("activities");
    const teams = db.getAll("teams");
    const playersCount = db.getAll("players").length;
    const events = db.getAll("activityEvents");

    const upcoming = events
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    const upcomingItems: ListItem[] = upcoming.map((e) => ({
      id: e.id,
      title: e.title,
      subtitle: `${e.date} · ${e.venue || ""}`,
      badge: { label: e.type },
      to: areaRoute("events"),
    }));

    const activityItems: ListItem[] = activities.map((a) => ({
      id: a.id,
      title: a.name,
      subtitle: a.category,
      to: areaRoute("activities"),
    }));

    const teamItems: ListItem[] = teams.map((t) => ({
      id: t.id,
      title: t.name,
      subtitle: `${t.ageGroup || ""} · ${t.playerStudentIds.length} players`,
      to: areaRoute("teams"),
    }));

    const resultItems: ListItem[] = events
      .filter((e) => !!e.result)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.date,
        badge: { label: e.result as string, variant: "success" as const },
        to: areaRoute("events"),
      }));

    return {
      activitiesCount: activities.length,
      teamsCount: teams.length,
      playersCount,
      upcomingCount: upcoming.length,
      upcomingItems,
      activityItems,
      teamItems,
      resultItems,
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Activities", icon: Trophy, to: areaRoute("activities"), tone: "accent" },
              { label: "Teams", icon: Users, to: areaRoute("teams") },
              { label: "Attendance", icon: CalendarCheck, to: areaRoute("attendance") },
              { label: "Events", icon: CalendarDays, to: areaRoute("events") },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          { label: "Activities", value: data.activitiesCount, icon: Trophy, tone: "primary", to: areaRoute("activities") },
          { label: "Teams", value: data.teamsCount, icon: Users, tone: "info", to: areaRoute("teams") },
          { label: "Players", value: data.playersCount, icon: UserCheck, tone: "success" },
          { label: "Upcoming Events", value: data.upcomingCount, icon: CalendarDays, tone: "accent", to: areaRoute("events") },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Upcoming Fixtures"
            icon={CalendarDays}
            items={data.upcomingItems}
            emptyText="No upcoming fixtures"
            viewAllTo={areaRoute("events")}
          />
        </div>
        <ListCard
          title="My Activities"
          icon={Trophy}
          items={data.activityItems}
          emptyText="No activities yet"
          viewAllTo={areaRoute("activities")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Teams"
            icon={Users}
            items={data.teamItems}
            emptyText="No teams yet"
            viewAllTo={areaRoute("teams")}
          />
        </div>
        <ListCard
          title="Recent Results"
          icon={Trophy}
          items={data.resultItems}
          emptyText="No results recorded"
          viewAllTo={areaRoute("events")}
        />
      </div>
    </div>
  );
}
