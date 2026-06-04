import { lazy, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ResourceListPage } from "@/components/shared/ResourceListPage";
import type { CollectionName, NavItem, ResourceConfig } from "@/types";

// dashboards & bespoke screens (landing pages stay eager to avoid skeleton flash on login)
import { DashboardRouter } from "@/features/dashboard/DashboardRouter";
import { HomeScreen } from "@/features/home/HomeScreen";
import { StudentsScreen } from "@/features/shared-domains/students/StudentsScreen";

import { ReportsRouter } from "@/features/reports/ReportsRouter";

// only the leaflet/heavy-but-secondary screens stay lazy
const LiveTrackingScreen = lazy(() => import("@/features/shared-domains/transport/LiveTrackingScreen").then((m) => ({ default: m.LiveTrackingScreen })));
import { NotificationCenter } from "@/features/shared-domains/comms/NotificationCenter";
import { ActivityMonitor } from "@/features/shared-domains/governance/ActivityMonitor";
import { ServiceRegistryScreen } from "@/features/super-admin/ServiceRegistryScreen";
import { FeeCollectionScreen } from "@/features/shared-domains/finance/FeeCollectionScreen";
import { MarksScreen } from "@/features/shared-domains/exams/MarksScreen";
import { AttendanceScreen } from "@/features/shared-domains/attendance/AttendanceScreen";
import { ChatScreen } from "@/features/shared-domains/chat/ChatScreen";
import { LibraryCirculationScreen } from "@/features/shared-domains/library/LibraryCirculationScreen";
import { SyllabusReader } from "@/features/shared-domains/syllabus/SyllabusReader";
import { LiveVideoRoom } from "@/features/shared-domains/live-video/LiveVideoRoom";
import { TimetableScreen } from "@/features/shared-domains/academics/TimetableScreen";
import { PermissionMatrix } from "@/features/shared-domains/governance/PermissionMatrix";
import { RateTeachersScreen } from "@/features/shared-domains/feedback/RateTeachersScreen";
import { PromotionScreen } from "@/features/shared-domains/students/PromotionScreen";
import { DocumentsCenter } from "@/features/shared-domains/documents/DocumentsCenter";
import { SchoolProfileScreen } from "@/features/shared-domains/school/SchoolProfileScreen";
import { ChildProfile } from "@/features/home/ChildProfile";
import { Profile } from "@/pages/Profile";
import { classroomResource, trainingResource, gradeScaleResource, reconciliationResource } from "@/features/shared-domains/misc/extraResources";
import { RecycleBinPage } from "@/features/shared-domains/recycle-bin/RecycleBinPage";
import { Settings } from "@/pages/Settings";

// resource configs
import { staffResource } from "@/features/shared-domains/staff/staffResource";
import { classResource } from "@/features/shared-domains/academics/classResource";
import { subjectResource } from "@/features/shared-domains/academics/subjectResource";
import { examResource } from "@/features/shared-domains/academics/examResource";
import { bookResource } from "@/features/shared-domains/library/bookResource";
import { reservationResource } from "@/features/shared-domains/library/reservationResource";
import { fineResource } from "@/features/shared-domains/library/fineResource";
import { labItemResource } from "@/features/shared-domains/lab/labItemResource";
import { labIssueResource } from "@/features/shared-domains/lab/labIssueResource";
import { labBookingResource } from "@/features/shared-domains/lab/labBookingResource";
import { labMaintenanceResource } from "@/features/shared-domains/lab/labMaintenanceResource";
import { activityResource } from "@/features/shared-domains/sports/activityResource";
import { teamResource } from "@/features/shared-domains/sports/teamResource";
import { equipmentResource } from "@/features/shared-domains/sports/equipmentResource";
import { vehicleResource } from "@/features/shared-domains/transport/vehicleResource";
import { routeResource } from "@/features/shared-domains/transport/routeResource";
import { incidentResource } from "@/features/shared-domains/transport/incidentResource";
import { noticeResource } from "@/features/shared-domains/comms/noticeResource";
import { inquiryResource } from "@/features/shared-domains/comms/inquiryResource";
import { complaintResource } from "@/features/shared-domains/comms/complaintResource";
import { visitorResource } from "@/features/shared-domains/comms/visitorResource";
import { courierResource } from "@/features/shared-domains/comms/courierResource";
import { appointmentResource } from "@/features/shared-domains/comms/appointmentResource";
import { expenseResource } from "@/features/shared-domains/finance/expenseResource";
import { payrollResource } from "@/features/shared-domains/finance/payrollResource";
import { feeStructureResource } from "@/features/shared-domains/finance/feeStructureResource";
import { eventResource } from "@/features/shared-domains/engagement/eventResource";
import { holidayResource } from "@/features/shared-domains/engagement/holidayResource";
import { ratingResource } from "@/features/shared-domains/engagement/ratingResource";
import { disciplineResource } from "@/features/shared-domains/engagement/disciplineResource";
import { templateResource } from "@/features/shared-domains/misc/templateResource";
import { fieldResource } from "@/features/shared-domains/misc/fieldResource";
import { homeworkResource } from "@/features/shared-domains/misc/homeworkResource";
import { learningResource } from "@/features/shared-domains/misc/learningResource";
import { leaveResource } from "@/features/shared-domains/misc/leaveResource";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const list = (config: ResourceConfig<any>) => () => <ResourceListPage config={config as ResourceConfig<CollectionName>} />;

type Factory = (area: string) => ReactNode;

const REGISTRY: Record<string, Factory> = {
  dashboard: () => <DashboardRouter />,
  home: () => <HomeScreen />,
  chat: () => <ChatScreen />,

  // people / academics
  students: () => <StudentsScreen />,
  "transfer-certificates": () => <StudentsScreen />,
  promotions: () => <PromotionScreen />,
  staff: list(staffResource),
  "staff-performance": () => <ReportsRouter />,
  members: list(staffResource),
  classes: list(classResource),
  "classes-sections": list(classResource),
  subjects: list(subjectResource),
  exams: list(examResource),
  papers: list(examResource),
  "exam-duty": list(examResource),
  homework: list(homeworkResource),
  learning: list(learningResource),
  "admission-fields": list(fieldResource),
  admissions: list(inquiryResource),
  timetable: () => <TimetableScreen />,
  scheduling: () => <TimetableScreen />,
  "grade-system": list(gradeScaleResource),
  classroom: list(classroomResource),
  "my-class": () => <StudentsScreen />,
  teachers: list(staffResource),
  "child-profile": () => <ChildProfile />,
  training: list(trainingResource),
  performance: () => <ReportsRouter />,
  profile: () => <Profile />,

  // marks workflow
  marks: () => <MarksScreen />,
  results: () => <MarksScreen />,
  "result-support": () => <MarksScreen />,
  verification: () => <MarksScreen />,
  evaluation: () => <MarksScreen />,

  // finance
  fees: () => <FeeCollectionScreen />,
  dues: () => <FeeCollectionScreen />,
  receipts: () => <FeeCollectionScreen />,
  "fee-structure": list(feeStructureResource),
  expenses: list(expenseResource),
  payroll: list(payrollResource),
  reconciliation: list(reconciliationResource),
  reports: () => <ReportsRouter />,
  "financial-reports": () => <ReportsRouter />,

  // library
  catalog: list(bookResource),
  library: list(bookResource),
  circulation: () => <LibraryCirculationScreen />,
  reservations: list(reservationResource),
  fines: list(fineResource),

  // lab
  "issue-return": list(labIssueResource),
  bookings: list(labBookingResource),
  practicals: list(labBookingResource),
  maintenance: list(labMaintenanceResource),
  "digital-resources": list(learningResource),
  "digital-library": list(learningResource),
  inventory: (area) => (area === "lab" ? <ResourceListPage config={labItemResource as ResourceConfig<CollectionName>} /> : <ResourceListPage config={bookResource as ResourceConfig<CollectionName>} />),

  // sports
  activities: list(activityResource),
  teams: list(teamResource),
  equipment: list(equipmentResource),

  // transport (parents/students/principal see the live map; admin manages the fleet)
  transport: (area) => (["parent", "student", "principal"].includes(area) ? <LiveTrackingScreen /> : <ResourceListPage config={vehicleResource as ResourceConfig<CollectionName>} />),
  vehicle: list(vehicleResource),
  "route-trip": list(routeResource),
  routes: list(routeResource),
  incidents: list(incidentResource),
  tracking: () => <LiveTrackingScreen />,
  "pickup-drop": () => <LiveTrackingScreen />,

  // attendance
  attendance: () => <AttendanceScreen />,
  biometric: () => <AttendanceScreen />,

  // communication
  notifications: () => <NotificationCenter />,
  communication: () => <NotificationCenter />,
  notices: list(noticeResource),
  inquiries: list(inquiryResource),
  complaints: list(complaintResource),
  visitors: list(visitorResource),
  records: list(visitorResource),
  courier: list(courierResource),
  appointments: list(appointmentResource),

  // engagement / documents
  events: list(eventResource),
  calendar: list(eventResource),
  feedback: (area) => (area === "student" || area === "parent" ? <RateTeachersScreen /> : <ResourceListPage config={ratingResource as ResourceConfig<CollectionName>} />),
  discipline: list(disciplineResource),
  behavior: list(disciplineResource),
  templates: list(templateResource),
  documents: list(templateResource),
  leave: list(leaveResource),
  holidays: list(holidayResource),
  syllabus: () => <SyllabusReader />,
  "live-video": () => <LiveVideoRoom />,
  livevideo: () => <LiveVideoRoom />,

  // communication extras
  "front-desk": list(appointmentResource),
  support: list(complaintResource),

  // documents extras
  "member-documents": () => <DocumentsCenter />,
  "bulk-export": () => <DocumentsCenter />,

  // governance / system
  activity: () => <ActivityMonitor />,
  services: () => <ServiceRegistryScreen />,
  "delete-permissions": () => <PermissionMatrix />,
  "roles-permissions": () => <PermissionMatrix />,
  "recycle-bin": () => <RecycleBinPage />,
  settings: () => <Settings />,
  "school-profile": () => <SchoolProfileScreen />,
  school: () => <SchoolProfileScreen />,
  schools: () => <SchoolProfileScreen />,
  "register-import": () => <DocumentsCenter />,
  "demo-reset": () => <Settings />,
};

export function PlaceholderScreen({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const Icon = item.icon ?? Construction;
  return (
    <div className="space-y-6">
      <PageHeader title={t(item.labelKey ?? item.label, item.label)} icon={<Icon className="size-5" />} />
      <EmptyState
        icon={Construction}
        title={`${item.label}`}
        description="This module is part of the system and will surface its records and workflows here."
        action={<Button asChild variant="outline"><Link to="..">{t("common.back", "Go back")}</Link></Button>}
      />
    </div>
  );
}

export function ScreenForItem({ item }: { item: NavItem }) {
  const parts = (item.to ?? "").split("/"); // ["", "app", area, slug, ...]
  const area = parts[2] ?? "";
  const slug = parts[3] ?? "dashboard";
  const factory = REGISTRY[slug];
  return <>{factory ? factory(area) : <PlaceholderScreen item={item} />}</>;
}

export function hasScreen(slug: string): boolean {
  return slug in REGISTRY;
}
