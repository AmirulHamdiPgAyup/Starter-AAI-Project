import Link from "next/link";
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
import { allowedActions, formatLeaveDates, leaveDaysLabel } from "@/lib/leave";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { RequestTable, type RequestRow } from "@/components/leave/RequestTable";
import { RequestActions } from "@/components/leave/RequestActions";
import { PageSuccessModal } from "@/components/leave/PageSuccessModal";

export const metadata = { title: "My leave requests · Budiman HRMS" };

// The Employee home (design §11): "Needs your action" on top — requests the
// employee must move (Ready to Send, Rejected) — and "History" below with
// every own request, newest first. Columns from design §13.
export default async function EmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; joined?: string }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const { sent, joined } = await searchParams;

  const requests = await prisma.leaveRequest.findMany({
    where: { employeeId: user.id },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
  const actor = { id: user.id, role: user.role };

  const toRow = (r: (typeof requests)[number], withButtons: boolean): RequestRow => {
    const allowed = withButtons ? allowedActions(actor, r) : [];
    const status: LeaveStatus = isLeaveStatus(r.status) ? r.status : "WAITING_SUPERVISOR";
    return {
      id: r.id,
      submitted: formatTimestamp(r.createdAt),
      type: isLeaveType(r.leaveType) ? LEAVE_TYPE_LABELS[r.leaveType] : r.leaveType,
      dates: formatLeaveDates(r.startDate, r.endDate),
      days: leaveDaysLabel(r.workingDays),
      status,
      statusLabel: LEAVE_STATUS_LABELS[status],
      remark: r.supervisorRemark ?? r.hrRemark ?? null,
      action: withButtons ? (
        <RequestActions
          requestId={r.id}
          canSendToHr={allowed.includes("sendToHr")}
          canResubmit={allowed.includes("resubmit")}
        />
      ) : undefined,
    };
  };

  const needsAction = requests.filter((r) => r.status === "READY_TO_SEND" || r.status === "REJECTED");
  const actionRows = needsAction.map((r) => toRow(r, true));
  const historyRows = requests.map((r) => toRow(r, false));

  return (
    <>
      <PageHeader
        title="My leave requests"
        description="Apply for leave and follow each request to its decision."
        action={
          <Link href="/employee/new" className={buttonClasses("primary")}>
            New leave request
          </Link>
        }
      />

      <Card className="mb-6">
        <CardHeader title="Needs your action" count={actionRows.length} />
        {actionRows.length === 0 ? (
          <EmptyState
            title="Nothing needs your action"
            description="Requests that need you will appear here."
          />
        ) : (
          <RequestTable rows={actionRows} />
        )}
      </Card>

      <Card>
        <CardHeader
          title="History"
          count={historyRows.length}
          description="Every request you have made, newest first."
        />
        {historyRows.length === 0 ? (
          <EmptyState
            title="No leave requests yet"
            description="Press New leave request to make your first one."
          />
        ) : (
          <RequestTable rows={historyRows} />
        )}
      </Card>

      <PageSuccessModal
        open={sent === "1"}
        title="Sent to HR"
        message="Your request is now waiting for HR."
        dismissHref="/employee"
      />

      {/* Self sign-up lands here signed in (design §12b); this page shows the
          success pop-up because the sign-up screen disappears on redirect. */}
      <PageSuccessModal
        open={joined === "1"}
        title="Welcome to Budiman HRMS"
        message="Your account is ready. Press New leave request to apply for leave."
        dismissHref="/employee"
      />
    </>
  );
}
