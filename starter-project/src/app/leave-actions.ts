"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  allowedActions,
  checkLeaveFields,
  isRemarkMissing,
  type LeaveAction,
} from "@/lib/leave";
import type { ActionResult } from "./actions";

// Server actions for the Leave Request module (design §14, §15).
// Every action re-checks on the server: logged in, right role, ownership or
// assignment, and the exact status the action needs. Hiding a button is not
// enough.

// Apply form (Task 9). Creates a request waiting for the supervisor.
export async function createLeaveRequest(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireRole("EMPLOYEE");

  const fields = checkLeaveFields({
    leaveType: String(formData.get("leaveType") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
  });
  if (fields.errors.length > 0) return { error: fields.errors.join(" ") };

  // The supervisor must be a real supervisor of the employee's own division
  // (design §10.3) — never trust the dropdown alone.
  const supervisor = await prisma.user.findUnique({
    where: { id: Number(formData.get("supervisorId")) },
  });
  if (
    !supervisor ||
    supervisor.role !== "SUPERVISOR" ||
    supervisor.division !== user.division
  ) {
    return { error: "Choose a supervisor from your own division." };
  }

  const reason = String(formData.get("reason") ?? "").trim();

  await prisma.leaveRequest.create({
    data: {
      employeeId: user.id,
      supervisorId: supervisor.id,
      leaveType: fields.leaveType!,
      startDate: fields.startDate!,
      endDate: fields.endDate!,
      workingDays: fields.workingDays!,
      reason: reason.length > 0 ? reason : null,
      status: "WAITING_SUPERVISOR",
    },
  });

  revalidatePath("/employee");
  return { ok: true, message: "Your leave request was sent to your supervisor." };
}

// Load a request the actor may perform this exact action on right now, or
// return null. Re-checks role, ownership/assignment and status server-side
// (design §15).
async function loadActionableRequest(
  userId: number,
  userRole: string,
  formData: FormData,
  action: LeaveAction,
): Promise<{ id: number } | null> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return null;
  const request = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!request) return null;
  const allowed = allowedActions({ id: userId, role: userRole }, request);
  return allowed.includes(action) ? { id: request.id } : null;
}

// Employee home (Task 10): send a signed request to the shared HR queue.
export async function sendToHr(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireRole("EMPLOYEE");
  const target = await loadActionableRequest(user.id, user.role, formData, "sendToHr");
  if (!target) return { error: "This request cannot be sent to HR right now." };

  await prisma.leaveRequest.update({
    where: { id: target.id },
    data: { status: "WAITING_HR" },
  });

  // The row leaves "Needs your action", so the page (not the row) shows the
  // success pop-up — see design §11.
  revalidatePath("/employee");
  redirect("/employee?sent=1");
}

// Supervisor home (Task 11): sign a waiting request. It becomes Ready to
// Send for the employee. Design §10.2 permission table.
export async function signLeave(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireRole("SUPERVISOR");
  const target = await loadActionableRequest(user.id, user.role, formData, "sign");
  if (!target) return { error: "This request is not waiting for your sign-off." };

  await prisma.leaveRequest.update({
    where: { id: target.id },
    data: { status: "READY_TO_SEND" },
  });

  revalidatePath("/supervisor");
  revalidatePath("/employee");
  redirect("/supervisor?signed=1");
}

// Supervisor home (Task 11): reject a waiting request. The remark is
// mandatory (design §10.5) and saved as supervisorRemark.
export async function rejectBySupervisor(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireRole("SUPERVISOR");
  const target = await loadActionableRequest(
    user.id,
    user.role,
    formData,
    "rejectAsSupervisor",
  );
  if (!target) return { error: "This request is not waiting for your decision." };

  const remark = String(formData.get("remark") ?? "");
  if (isRemarkMissing(remark)) {
    return { error: "Write a remark so the employee knows why." };
  }

  await prisma.leaveRequest.update({
    where: { id: target.id },
    data: { status: "REJECTED", supervisorRemark: remark.trim() },
  });

  revalidatePath("/supervisor");
  revalidatePath("/employee");
  redirect("/supervisor?rejected=1");
}
