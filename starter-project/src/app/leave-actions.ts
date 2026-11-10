"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkLeaveFields } from "@/lib/leave";
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
