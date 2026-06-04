import { useMemo } from "react";
import { format } from "date-fns";
import {
  Inbox,
  ClipboardList,
  CalendarDays,
  Clock,
  CalendarCheck,
  Users,
  MessageSquare,
  Package,
  Plus,
  UserPlus,
  CalendarPlus,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";

const APPOINTMENT_BADGE: Record<string, ListItem["badge"]> = {
  requested: { label: "Requested", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "success" },
  done: { label: "Done", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const COURIER_BADGE: Record<string, ListItem["badge"]> = {
  received: { label: "Received", variant: "info" },
  dispatched: { label: "Dispatched", variant: "secondary" },
  delivered: { label: "Delivered", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
};

export function ReceptionistDashboard() {
  const today = format(new Date(), "yyyy-MM-dd");

  const data = useMemo(() => {
    const inquiries = db.getAll("inquiries");
    const visitors = db.getAll("visitors");
    const appointments = db.getAll("appointments");
    const couriers = db.getAll("couriers");

    const newInquiries = inquiries.filter((i) => i.status === "new");
    const visitorsIn = visitors.filter((v) => v.status === "in");
    const appointmentsToday = appointments.filter((a) => a.dateTime.slice(0, 10) === today);

    const stats = [
      {
        label: "Today's Inquiries",
        value: newInquiries.length,
        icon: Inbox,
        tone: "info" as const,
        to: areaRoute("inquiries"),
      },
      {
        label: "Visitors In",
        value: visitorsIn.length,
        icon: ClipboardList,
        tone: "warning" as const,
        to: areaRoute("visitors"),
      },
      {
        label: "Appointments Today",
        value: appointmentsToday.length,
        icon: CalendarDays,
        tone: "primary" as const,
        to: areaRoute("appointments"),
      },
      {
        label: "Pending Follow-ups",
        value: newInquiries.length,
        icon: Clock,
        tone: "accent" as const,
      },
    ];

    const appointmentItems: ListItem[] = appointments
      .filter((a) => a.status === "requested" || a.status === "confirmed")
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
      .map((a) => ({
        id: a.id,
        title: a.requestedByName,
        subtitle: a.purpose,
        badge: APPOINTMENT_BADGE[a.status],
        to: areaRoute("appointments"),
      }));

    const visitorItems: ListItem[] = visitorsIn
      .sort((a, b) => b.inTime.localeCompare(a.inTime))
      .map((v) => {
        const [first, ...rest] = v.visitorName.split(" ");
        return {
          id: v.id,
          title: v.visitorName,
          subtitle: v.purpose,
          avatar: { first, last: rest.join(" ") },
        };
      });

    const inquiryItems: ListItem[] = [...inquiries]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((i) => ({
        id: i.id,
        title: i.name,
        subtitle: i.subject,
        badge: { label: i.source, variant: "outline" as const },
        to: areaRoute("inquiries"),
      }));

    const courierItems: ListItem[] = [...couriers]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((c) => ({
        id: c.id,
        title: c.company,
        subtitle: c.description,
        badge: COURIER_BADGE[c.status],
      }));

    return { stats, appointmentItems, visitorItems, inquiryItems, courierItems };
  }, [today]);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "New Inquiry", icon: Plus, to: areaRoute("inquiries"), tone: "accent" },
              { label: "New Visitor", icon: UserPlus, to: areaRoute("visitors") },
              { label: "Appointment", icon: CalendarPlus, to: areaRoute("appointments") },
            ]}
          />
        }
      />

      <StatGrid cols={4} items={data.stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Today's Appointments"
            icon={CalendarCheck}
            items={data.appointmentItems}
            emptyText="No appointments scheduled"
            viewAllTo={areaRoute("appointments")}
            max={7}
          />
        </div>
        <ListCard
          title="Visitors In"
          icon={Users}
          items={data.visitorItems}
          emptyText="No visitors on premises"
          viewAllTo={areaRoute("visitors")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Recent Inquiries"
            icon={MessageSquare}
            items={data.inquiryItems}
            emptyText="No inquiries yet"
            viewAllTo={areaRoute("inquiries")}
            max={7}
          />
        </div>
        <ListCard
          title="Couriers"
          icon={Package}
          items={data.courierItems}
          emptyText="No courier records"
          viewAllTo={areaRoute("couriers")}
        />
      </div>
    </div>
  );
}
