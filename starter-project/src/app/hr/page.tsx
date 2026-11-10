import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
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
import { DecisionTable, type DecisionRow } from "@/components/leave/DecisionTable";
import { RequestActions } from "@/components/leave/RequestActions";
import { PageSuccessModal } from "@/components/leave/PageSuccessModal";

export const metadata = { title: "Leave requests to decide · Budiman HRMS" };

type RequestForHr = {
  id: number;
  employeeId: number;
  supervisorId: number;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  workingDays: number;
  reason: string | null;
  status: string;
  supervisorRemark: string | null;
  hrRemark: string | null;
  employee: { name: string; division: string };
  hrDecidedBy: { name: string } | null;
};

// The HR home (design §11): "Needs your action" is the shared queue — every
// Waiting for HR request, open to both officers; the first one to decide
// wins. "History" lists every decided request with the deciding officer.
// Columns from design §13.
export default async function HrPage({
  searchParams,
}: {
  searchParams: Promise<{ approved?: string; rejected?: string }>;
}) {
  const user = await requireRole("HR");
  const { approved, rejected } = await searchParams;

  const requests = await prisma.leaveRequest.findMany({
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    include: {
      employee: { select: { name: true, division: true } },
      hrDecidedBy: { select: { name: true } },
    },
  });
  const actor = { id: user.id, role: user.role };

  const toRow = (r: RequestForHr, withButtons: boolean, showDecided: boolean): DecisionRow => {
    const allowed = withButtons ? allowedActions(actor, r) : [];
    const status: LeaveStatus = isLeaveStatus(r.status) ? r.status : "WAITING_HR";
    return {
      id: r.id,
      employee: r.employee.name,
      division: r.employee.division,
      dates: formatLeaveDates(r.startDate, r.endDate),
      days: leaveDaysLabel(r.workingDays),
      type: isLeaveType(r.leaveType) ? LEAVE_TYPE_LABELS[r.leaveType] : r.leaveType,
      reason: r.reason,
      status: showDecided ? status : undefined,
      statusLabel: showDecided ? LEAVE_STATUS_LABELS[status] : undefined,
      decidedBy: showDecided ? r.hrDecidedBy?.name ?? null : undefined,
      // The HR remark when HR rejected, otherwise the supervisor's — the
      // last remark written is the one that matters (design §10.5).
      remark: showDecided ? r.hrRemark ?? r.supervisorRemark : undefined,
      action: withButtons ? (
        <RequestActions
          requestId={r.id}
          canApprove={allowed.includes("approve")}
          canRejectAsHr={allowed.includes("rejectAsHr")}
        />
      ) : undefined,
    };
  };

  const needsAction = requests.filter((r) => r.status === "WAITING_HR");
  const actionRows = needsAction.map((r) => toRow(r, true, false));
  const historyRows = requests
    .filter((r) => r.status === "APPROVED" || r.status === "REJECTED")
    .map((r) => toRow(r, false, true));

  const success =
    approved === "1"
      ? { title: "Request approved", message: "The employee can see it in their history." }
      : rejected === "1"
        ? { title: "Request rejected", message: "Your remark was saved for the employee." }
        : null;

  return (
    <>
      <PageHeader
        title="Leave requests to decide"
        description="Approve or reject the requests that reached HR."
      />

      <Card className="mb-6">
        <CardHeader title="Needs your action" count={actionRows.length} />
        {actionRows.length === 0 ? (
          <EmptyState
            title="Nothing needs your action"
            description="Requests waiting for an HR decision appear here."
          />
        ) : (
          <DecisionTable rows={actionRows} />
        )}
      </Card>

      <Card>
        <CardHeader
          title="History"
          count={historyRows.length}
          description="Every approved or rejected request, newest first."
        />
        {historyRows.length === 0 ? (
          <EmptyState
            title="Nothing decided yet"
            description="Requests approved or rejected by HR will appear here."
          />
        ) : (
          <DecisionTable rows={historyRows} showStatus showDecidedBy showRemarks />
        )}
      </Card>

      <PageSuccessModal
        open={Boolean(success)}
        title={success?.title ?? ""}
        message={success?.message}
        dismissHref="/hr"
      />
    </>
  );
}
