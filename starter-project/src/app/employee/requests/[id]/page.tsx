import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  formatTimestamp,
  isLeaveStatus,
  isLeaveType,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  type LeaveStatus,
} from "@/lib/constants";
import { formatLeaveDates, leaveDaysLabel } from "@/lib/leave";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { StatusPill } from "@/components/leave/RequestTable";

export const metadata = { title: "Leave request · Budiman HRMS" };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

// View one own request (design §11). When it is Rejected, the Edit &
// resubmit button reopens the prefilled form (Task 13). Someone else's
// request is indistinguishable from a missing one.
export default async function LeaveRequestViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { supervisor: { select: { name: true } } },
  });
  if (!request || request.employeeId !== user.id) notFound();

  const status: LeaveStatus = isLeaveStatus(request.status)
    ? request.status
    : "WAITING_SUPERVISOR";
  // The last remark written (design §10.5).
  const remark = request.supervisorRemark ?? request.hrRemark;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Leave request"
        description="Check where your request stands and act on it when needed."
      />

      <Card className="p-5 sm:p-6">
        <dl className="divide-y divide-slate-100 text-sm">
          <Row label="Status">
            <StatusPill status={status} label={LEAVE_STATUS_LABELS[status]} />
          </Row>
          <Row label="Leave type">
            {isLeaveType(request.leaveType)
              ? LEAVE_TYPE_LABELS[request.leaveType]
              : request.leaveType}
          </Row>
          <Row label="Dates">
            {formatLeaveDates(request.startDate, request.endDate)}
          </Row>
          <Row label="Days">{leaveDaysLabel(request.workingDays)}</Row>
          <Row label="Supervisor">{request.supervisor.name}</Row>
          <Row label="Reason">{request.reason ?? "—"}</Row>
          <Row label="Remark">{remark ?? "—"}</Row>
          <Row label="Submitted on">{formatTimestamp(request.createdAt)}</Row>
        </dl>

        <div className="mt-5 flex items-center gap-3">
          {status === "REJECTED" ? (
            <Link
              href={`/employee/requests/${request.id}/edit`}
              className={buttonClasses("primary")}
            >
              Edit &amp; resubmit
            </Link>
          ) : null}
          <Link href="/employee" className={buttonClasses("secondary")}>
            Back to my requests
          </Link>
        </div>
      </Card>
    </div>
  );
}
