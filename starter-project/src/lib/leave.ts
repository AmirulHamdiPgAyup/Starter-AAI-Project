// The Leave Request module's rules in one place (docs/specs/02-design.md
// §10): counting working days, checking form fields, and answering
// "what may this user do to this request right now". Pure functions only —
// they never touch the database, so server actions can re-check everything.

import { isLeaveType, isLeaveStatus, WEEKEND_DAYS, type LeaveType } from "./constants";

// A leave request as far as these rules care (a subset of the table).
export interface LeaveRequestLike {
  employeeId: number;
  supervisorId: number;
  status: string;
}

// Who the user is, as far as these rules care.
export interface UserLike {
  id: number;
  role: string;
}

// Parse a YYYY-MM-DD date input as midnight UTC. Returns null for anything
// else, so callers can reject it with a clear message.
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  // Reject inputs that shifted, e.g. 2026-02-30.
  return d.toISOString().slice(0, 10) === value ? d : null;
}

// Count days from start to end, inclusive, skipping WEEKEND_DAYS.
// Uses UTC calendar parts so the company time zone never shifts a date.
// Returns -1 when end is before start (an invalid range).
export function countWorkingDays(start: Date, end: Date): number {
  const s = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const e = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  if (e < s) return -1;
  const DAY_MS = 24 * 60 * 60 * 1000;
  let days = 0;
  for (let t = s; t <= e; t += DAY_MS) {
    const weekday = new Date(t).getUTCDay();
    if (!(WEEKEND_DAYS as readonly number[]).includes(weekday)) days += 1;
  }
  return days;
}

export interface LeaveFieldsInput {
  leaveType: string;
  startDate: string; // raw form input, YYYY-MM-DD
  endDate: string;
}

export interface LeaveFieldsResult {
  errors: string[]; // human-readable, shown above the form
  leaveType?: LeaveType;
  startDate?: Date;
  endDate?: Date;
  workingDays?: number;
}

// Check the fields that need no database (type and dates). The server
// action checks supervisor and reason on top of this. (design §10.1–10.2)
export function checkLeaveFields(input: LeaveFieldsInput): LeaveFieldsResult {
  const errors: string[] = [];

  if (!isLeaveType(input.leaveType)) {
    errors.push("Choose a leave type.");
  }
  const startDate = parseDateInput(input.startDate);
  const endDate = parseDateInput(input.endDate);
  if (!startDate) errors.push("Enter a valid start date.");
  if (!endDate) errors.push("Enter a valid end date.");
  if (!startDate || !endDate) return { errors };

  const workingDays = countWorkingDays(startDate, endDate);
  if (workingDays < 0) {
    errors.push("The end date cannot be before the start date.");
    return { errors };
  }
  if (workingDays === 0) {
    errors.push("These dates contain no working days (weekends only).");
    return { errors };
  }

  return { errors, leaveType: input.leaveType as LeaveType, startDate, endDate, workingDays };
}

// The things a user may do to one request right now. The screens show
// buttons for these; the server actions call this too before saving.
// Rules: design §10.4 — the only allowed status changes.
export type LeaveAction =
  | "sign"
  | "rejectAsSupervisor"
  | "sendToHr"
  | "approve"
  | "rejectAsHr"
  | "resubmit";

export function allowedActions(user: UserLike, request: LeaveRequestLike): LeaveAction[] {
  const status = isLeaveStatus(request.status) ? request.status : null;
  if (!status) return [];

  if (user.role === "SUPERVISOR" && request.supervisorId === user.id && status === "WAITING_SUPERVISOR") {
    return ["sign", "rejectAsSupervisor"];
  }
  if (user.role === "HR" && status === "WAITING_HR") {
    return ["approve", "rejectAsHr"];
  }
  if (user.role === "EMPLOYEE" && request.employeeId === user.id) {
    if (status === "READY_TO_SEND") return ["sendToHr"];
    if (status === "REJECTED") return ["resubmit"];
  }
  return [];
}

// A remark is mandatory on both rejections (design §10.5).
export function isRemarkMissing(remark: string): boolean {
  return remark.trim().length === 0;
}

// The date range as shown in tables, e.g. "07-12-2026 – 11-12-2026".
export function formatLeaveDates(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .format(d)
      .replaceAll("/", "-");
  return `${fmt(start)} – ${fmt(end)}`;
}

export function leaveDaysLabel(workingDays: number): string {
  return workingDays === 1 ? "1 day" : `${workingDays} days`;
}
