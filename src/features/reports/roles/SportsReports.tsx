import { useMemo } from "react";
import { CalendarDays, Trophy, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  ChartCard,
  BarSeries,
  Donut,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";

/** Trim long activity names so chart axis labels stay readable. */
function shortName(name: string, max = 12): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

const EVENT_TYPES = ["match", "competition", "performance", "practice"] as const;
const EVENT_TYPE_COLORS: Record<(typeof EVENT_TYPES)[number], string> = {
  match: "hsl(var(--chart-1))",
  competition: "hsl(var(--chart-2))",
  performance: "hsl(var(--chart-3))",
  practice: "hsl(var(--chart-4))",
};

export function SportsReports() {
  const data = useMemo(() => {
    const activities = db.getAll("activities");
    const teams = db.getAll("teams");
    const players = db.getAll("players");
    const events = db.getAll("activityEvents");

    // Players per activity
    const playersByActivity = new Map<string, number>();
    for (const p of players) {
      playersByActivity.set(p.activityId, (playersByActivity.get(p.activityId) ?? 0) + 1);
    }
    const playersPerActivity = activities.map((a) => ({
      name: shortName(a.name),
      Players: playersByActivity.get(a.id) ?? 0,
    }));

    // Teams per activity
    const teamsByActivity = new Map<string, number>();
    for (const t of teams) {
      teamsByActivity.set(t.activityId, (teamsByActivity.get(t.activityId) ?? 0) + 1);
    }
    const teamsPerActivity = activities.map((a) => ({
      name: shortName(a.name),
      Teams: teamsByActivity.get(a.id) ?? 0,
    }));

    // Events by type (donut)
    const eventTypeCounts = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + 1;
      return acc;
    }, {});
    const eventsByType = EVENT_TYPES.map((type) => ({
      name: type[0].toUpperCase() + type.slice(1),
      value: eventTypeCounts[type] ?? 0,
      color: EVENT_TYPE_COLORS[type],
    })).filter((d) => d.value > 0);

    // Recent results
    const resultItems: ListItem[] = events
      .filter((e) => !!e.result)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.date,
        badge: { label: e.result as string, variant: "success" as const },
      }));

    return {
      activitiesCount: activities.length,
      teamsCount: teams.length,
      playersCount: players.length,
      eventsCount: events.length,
      playersPerActivity,
      teamsPerActivity,
      eventsByType,
      resultItems,
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sports Reports"
        description="Participation, teams and event outcomes across your activities."
        icon={<Trophy className="size-5" />}
      />

      <StatGrid
        cols={4}
        items={[
          { label: "Activities", value: data.activitiesCount, icon: Trophy, tone: "primary" },
          { label: "Teams", value: data.teamsCount, icon: Users, tone: "info" },
          { label: "Players", value: data.playersCount, icon: UserCheck, tone: "success" },
          { label: "Events", value: data.eventsCount, icon: CalendarDays, tone: "accent" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Players per Activity">
          <BarSeries
            data={data.playersPerActivity}
            xKey="name"
            series={[{ key: "Players", label: "Players" }]}
          />
        </ChartCard>

        <ChartCard title="Events by Type">
          <Donut data={data.eventsByType} />
        </ChartCard>

        <ChartCard title="Teams per Activity">
          <BarSeries
            data={data.teamsPerActivity}
            xKey="name"
            series={[{ key: "Teams", label: "Teams" }]}
          />
        </ChartCard>

        <ListCard
          title="Recent Results"
          icon={Trophy}
          items={data.resultItems}
          emptyText="No results recorded yet"
          max={8}
        />
      </div>
    </div>
  );
}
