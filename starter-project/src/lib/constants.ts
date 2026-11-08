// Shared constants and helpers for the Budiman HRMS starter app.
// Roles are a plain string union (SQLite has no enums).
// The Leave Request module adds its own constants here in Session 2.

export const ROLES = ["EMPLOYEE", "SUPERVISOR", "HR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "Employee",
  SUPERVISOR: "Supervisor",
  HR: "HR",
  ADMIN: "Admin",
};

// Every account uses a company email address.
export const EMAIL_DOMAIN = "budiman.com";

// The divisions and designations a user can have. Stored as plain text on the user.
export const DIVISIONS = [
  "Software Development",
  "Quality Assurance",
  "IT Infrastructure & Operations",
  "Cybersecurity",
  "Data & Analytics",
  "Product & Design",
  "Customer Support",
  "Human Resources",
  "Finance & Administration",
  "Management",
] as const;

export const DESIGNATIONS = [
  "Software Engineer",
  "QA Engineer",
  "System Administrator",
  "IT Support Technician",
  "Data Analyst",
  "UI/UX Designer",
  "Team Lead",
  "HR Officer",
  "Administrative Officer",
  "Director",
] as const;

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

// The company's time zone. It decides what "today" is and how dates are shown.
export const APP_TIME_ZONE = "Asia/Brunei";

// Today's date in the company time zone, as a YYYY-MM-DD string.
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Format a moment in time (e.g. submittedAt) as DD-MM-YYYY in the company time zone.
export function formatTimestamp(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(d)
    .replaceAll("/", "-");
}
