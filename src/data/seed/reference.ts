/** Static reference data for the deterministic demo seed. */

export const DEMO_PASSWORD = "demo1234";
export const DEMO_PIN = "1234";

export const FIRST_NAMES_M = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rudra",
  "Kabir", "Ayaan", "Dhruv", "Atharv", "Yuvan", "Ansh", "Aryan", "Rohan", "Dev", "Karan",
  "Naksh", "Parth", "Veer", "Shaurya", "Laksh", "Om", "Madhav", "Tanish", "Harsh", "Nikhil",
];
export const FIRST_NAMES_F = [
  "Aadhya", "Saanvi", "Ananya", "Diya", "Pari", "Anika", "Navya", "Riya", "Myra", "Sara",
  "Aaradhya", "Kiara", "Ira", "Avni", "Ishita", "Prisha", "Siya", "Aanya", "Tara", "Mahi",
  "Khushi", "Nisha", "Pooja", "Sneha", "Meera", "Kavya", "Trisha", "Anvi", "Rhea", "Jiya",
];
export const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Patel", "Kumar", "Jain", "Mehta", "Nair", "Reddy",
  "Iyer", "Yadav", "Chauhan", "Rao", "Joshi", "Mishra", "Pandey", "Agarwal", "Bhat", "Desai",
  "Kapoor", "Malhotra", "Chopra", "Bose", "Das", "Menon", "Pillai", "Saxena", "Tiwari", "Dubey",
];

export const HOUSES = ["Ruby", "Emerald", "Sapphire", "Topaz"];
export const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
export const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist"];
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
export const DEPARTMENTS = ["Science", "Mathematics", "Languages", "Social Science", "Computer", "Arts", "Physical Education", "Administration"];

/** Class ladder: name, numeric level. */
export const CLASS_LADDER: { name: string; level: number }[] = [
  { name: "Nursery", level: 0 },
  { name: "LKG", level: 1 },
  { name: "UKG", level: 2 },
  { name: "Class 1", level: 3 },
  { name: "Class 2", level: 4 },
  { name: "Class 3", level: 5 },
  { name: "Class 4", level: 6 },
  { name: "Class 5", level: 7 },
  { name: "Class 6", level: 8 },
  { name: "Class 7", level: 9 },
  { name: "Class 8", level: 10 },
  { name: "Class 9", level: 11 },
  { name: "Class 10", level: 12 },
  { name: "Class 11", level: 13 },
  { name: "Class 12", level: 14 },
];

export interface SubjectDef {
  name: string;
  code: string;
  type: "core" | "elective" | "practical" | "activity";
  hasPractical?: boolean;
  maxMarks?: number;
  passMarks?: number;
}
export const PRIMARY_SUBJECTS: SubjectDef[] = [
  { name: "English", code: "ENG", type: "core" },
  { name: "Hindi", code: "HIN", type: "core" },
  { name: "Mathematics", code: "MAT", type: "core" },
  { name: "Environmental Studies", code: "EVS", type: "core" },
  { name: "General Knowledge", code: "GK", type: "core" },
  { name: "Drawing", code: "ART", type: "activity" },
];
export const MIDDLE_SUBJECTS: SubjectDef[] = [
  { name: "English", code: "ENG", type: "core" },
  { name: "Hindi", code: "HIN", type: "core" },
  { name: "Mathematics", code: "MAT", type: "core" },
  { name: "Science", code: "SCI", type: "core", hasPractical: true },
  { name: "Social Science", code: "SST", type: "core" },
  { name: "Computer", code: "CMP", type: "practical", hasPractical: true },
  { name: "Sanskrit", code: "SAN", type: "elective" },
];
export const SENIOR_SUBJECTS: SubjectDef[] = [
  { name: "English", code: "ENG", type: "core" },
  { name: "Physics", code: "PHY", type: "core", hasPractical: true },
  { name: "Chemistry", code: "CHE", type: "core", hasPractical: true },
  { name: "Mathematics", code: "MAT", type: "core" },
  { name: "Biology", code: "BIO", type: "elective", hasPractical: true },
  { name: "Computer Science", code: "CS", type: "elective", hasPractical: true },
];

export function subjectsForLevel(level: number): SubjectDef[] {
  if (level <= 7) return PRIMARY_SUBJECTS;
  if (level <= 10) return MIDDLE_SUBJECTS;
  return SENIOR_SUBJECTS;
}

export const GRADE_BANDS = [
  { min: 91, max: 100, grade: "A1", gpa: 10, remark: "Outstanding" },
  { min: 81, max: 90, grade: "A2", gpa: 9, remark: "Excellent" },
  { min: 71, max: 80, grade: "B1", gpa: 8, remark: "Very Good" },
  { min: 61, max: 70, grade: "B2", gpa: 7, remark: "Good" },
  { min: 51, max: 60, grade: "C1", gpa: 6, remark: "Fair" },
  { min: 41, max: 50, grade: "C2", gpa: 5, remark: "Satisfactory" },
  { min: 33, max: 40, grade: "D", gpa: 4, remark: "Needs Improvement" },
  { min: 0, max: 32, grade: "E", gpa: 0, remark: "Unsatisfactory" },
];

/** Preloaded holiday calendar for 2025-26. */
export const HOLIDAYS: { date: string; name: string; type: "national" | "festival" | "school" | "optional" }[] = [
  { date: "2025-08-15", name: "Independence Day", type: "national" },
  { date: "2025-08-27", name: "Ganesh Chaturthi", type: "festival" },
  { date: "2025-10-02", name: "Gandhi Jayanti", type: "national" },
  { date: "2025-10-20", name: "Diwali", type: "festival" },
  { date: "2025-10-21", name: "Govardhan Puja", type: "festival" },
  { date: "2025-11-05", name: "Guru Nanak Jayanti", type: "festival" },
  { date: "2025-12-25", name: "Christmas", type: "festival" },
  { date: "2026-01-01", name: "New Year", type: "school" },
  { date: "2026-01-14", name: "Makar Sankranti", type: "festival" },
  { date: "2026-01-26", name: "Republic Day", type: "national" },
  { date: "2026-03-04", name: "Holi", type: "festival" },
  { date: "2026-03-21", name: "Annual Day", type: "school" },
  { date: "2026-04-14", name: "Ambedkar Jayanti", type: "national" },
  { date: "2026-05-01", name: "Summer Vacation Begins", type: "school" },
];

export const FEE_HEADS = [
  { name: "Tuition Fee", recurrence: "monthly" as const, defaultAmount: 2500, isTransport: false },
  { name: "Admission Fee", recurrence: "one-time" as const, defaultAmount: 5000, isTransport: false },
  { name: "Exam Fee", recurrence: "term" as const, defaultAmount: 800, isTransport: false },
  { name: "Library Fee", recurrence: "annual" as const, defaultAmount: 600, isTransport: false },
  { name: "Computer Fee", recurrence: "annual" as const, defaultAmount: 1200, isTransport: false },
  { name: "Transport Fee", recurrence: "monthly" as const, defaultAmount: 1500, isTransport: true },
  { name: "Activity Fee", recurrence: "annual" as const, defaultAmount: 1000, isTransport: false },
];

export const BOOKS = [
  { title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography", language: "English" },
  { title: "The Jungle Book", author: "Rudyard Kipling", category: "Fiction", language: "English" },
  { title: "Panchatantra Tales", author: "Vishnu Sharma", category: "Children", language: "English" },
  { title: "NCERT Science 8", author: "NCERT", category: "Textbook", language: "English" },
  { title: "NCERT Mathematics 10", author: "NCERT", category: "Textbook", language: "English" },
  { title: "Malgudi Days", author: "R.K. Narayan", category: "Fiction", language: "English" },
  { title: "Gaban", author: "Munshi Premchand", category: "Fiction", language: "Hindi" },
  { title: "Discovery of India", author: "Jawaharlal Nehru", category: "History", language: "English" },
  { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", language: "English" },
  { title: "The Story of My Experiments with Truth", author: "M.K. Gandhi", category: "Biography", language: "English" },
  { title: "Harry Potter & the Philosopher's Stone", author: "J.K. Rowling", category: "Fiction", language: "English" },
  { title: "Atomic Structure Made Easy", author: "S. Chand", category: "Reference", language: "English" },
  { title: "Indian Constitution", author: "P.M. Bakshi", category: "Reference", language: "English" },
  { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", language: "English" },
  { title: "Computer Fundamentals", author: "P.K. Sinha", category: "Textbook", language: "English" },
];

export const LAB_ITEMS = [
  { name: "Microscope", category: "equipment", labType: "biology", unit: "pcs", qty: 15, reorder: 5 },
  { name: "Test Tubes", category: "apparatus", labType: "chemistry", unit: "pcs", qty: 200, reorder: 50 },
  { name: "Bunsen Burner", category: "equipment", labType: "chemistry", unit: "pcs", qty: 20, reorder: 6 },
  { name: "Sodium Chloride", category: "chemical", labType: "chemistry", unit: "g", qty: 500, reorder: 100 },
  { name: "Hydrochloric Acid", category: "chemical", labType: "chemistry", unit: "ml", qty: 1000, reorder: 250 },
  { name: "Beaker 250ml", category: "apparatus", labType: "chemistry", unit: "pcs", qty: 60, reorder: 15 },
  { name: "Voltmeter", category: "equipment", labType: "physics", unit: "pcs", qty: 18, reorder: 5 },
  { name: "Ammeter", category: "equipment", labType: "physics", unit: "pcs", qty: 18, reorder: 5 },
  { name: "Convex Lens", category: "apparatus", labType: "physics", unit: "pcs", qty: 30, reorder: 8 },
  { name: "Desktop Computer", category: "equipment", labType: "computer", unit: "pcs", qty: 40, reorder: 5 },
  { name: "Specimen Slides", category: "specimen", labType: "biology", unit: "pcs", qty: 120, reorder: 30 },
] as const;

export const ACTIVITIES = [
  { name: "Cricket", category: "sport" as const, icon: "trophy" },
  { name: "Football", category: "sport" as const, icon: "trophy" },
  { name: "Basketball", category: "sport" as const, icon: "trophy" },
  { name: "Classical Dance", category: "cultural" as const, icon: "music" },
  { name: "Music", category: "cultural" as const, icon: "music" },
  { name: "Karate", category: "martial" as const, icon: "shield" },
  { name: "Swimming", category: "aquatic" as const, icon: "waves" },
];

/** Role → how many staff to generate (beyond the single demo account). */
export const STAFF_COUNTS: Record<string, number> = {
  principal: 1,
  accountant: 2,
  receptionist: 2,
  librarian: 1,
  lab_assistant: 2,
  examiner: 2,
  sports_coach: 2,
  bus_driver: 3,
  bus_helper: 2,
  other_staff: 3,
};

/** The 15 one-click demo accounts shown on the login screen. */
export const DEMO_ROLE_ACCOUNTS = [
  "super_admin", "admin", "principal", "accountant", "receptionist",
  "librarian", "lab_assistant", "examiner", "sports_coach", "class_teacher",
  "subject_teacher", "bus_driver", "other_staff", "parent", "student",
] as const;
