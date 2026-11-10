import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isLeaveType, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { allowedActions, formatLeaveDates, leaveDaysLabel } from "@/lib/leave";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DecisionTable, type DecisionRow } from "@/components/leave/DecisionTable";
import { RequestActions } from "@/components/leave/RequestActions";
import { PageSuccessModal } from "@/components/leave/PageSuccessModal";

export const metadata = { title: "Leave requests to review · Budiman HRMS" };

type RequestWithEmployee = {
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
  employee: { name: string; designation: string };
};

// "Your decision" for the history table (design §13): still waiting shows a
// dash, a supervisor remark means they rejected, anything past that they
// signed.
function decisionLabel(status: string, supervisorRemark: string | null): string {
  if (status === "WAITING_SUPERVISOR") return "—";
  return supervisorRemark ? "Rejected" : "Signed";
}

// The Supervisor home (design §11): "Needs your action" — own requests
// waiting for sign-off — and "History" with every request ever sent to them,
// newest first. Columns from design §13.
export default async function SupervisorPage({
  searchParams,
}: {
  searchParams: Promise<{ signed?: string; rejected?: string }>;
}) {
  const user = await requireRole("SUPERVISOR");
  const { signed, rejected } = await searchParams;

  const requests = await prisma.leaveRequest.findMany({
    where: { supervisorId: user.id },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    include: { employee: { select: { name: true, designation: true } } },
  });
  const actor = { id: user.id, role: user.role };

  const toRow = (
    r: RequestWithEmployee,
    withButtons: boolean,
    showDecision: boolean,
  ): DecisionRow => {
    const allowed = withButtons ? allowedActions(actor, r) : [];
    return {
      id: r.id,
      employee: r.employee.name,
      designation: r.employee.designation,
      dates: formatLeaveDates(r.startDate, r.endDate),
      days: leaveDaysLabel(r.workingDays),
      type: isLeaveType(r.leaveType) ? LEAVE_TYPE_LABELS[r.leaveType] : r.leaveType,
      reason: r.reason,
      decision: showDecision ? decisionLabel(r.status, r.supervisorRemark) : undefined,
      action: withButtons ? (
        <RequestActions
          requestId={r.id}
          canSign={allowed.includes("sign")}
          canRejectAsSupervisor={allowed.includes("rejectAsSupervisor")}
        />
      ) : undefined,
    };
  };

  const needsAction = requests.filter((r) => r.status === "WAITING_SUPERVISOR");
  const actionRows = needsAction.map((r) => toRow(r, true, false));
  const historyRows = requests.map((r) => toRow(r, false, true));

  const success =
    signed === "1"
      ? { title: "Request signed", message: "The employee can now send it to HR." }
      : rejected === "1"
        ? { title: "Request rejected", message: "Your remark was saved for the employee." }
        : null;

  return (
    <>
      <PageHeader
        title="Leave requests to review"
        description="Sign or reject the requests your team has sent you."
      />

      <Card className="mb-6">
        <CardHeader title="Needs your action" count={actionRows.length} />
        {actionRows.length === 0 ? (
          <EmptyState
            title="Nothing needs your action"
            description="Requests waiting for your sign-off appear here."
          />
        ) : (
          <DecisionTable rows={actionRows} />
        )}
      </Card>

      <Card>
        <CardHeader
          title="History"
          count={historyRows.length}
          description="Every request sent to you, newest first."
        />
        {historyRows.length === 0 ? (
          <EmptyState
            title="Nothing sent to you yet"
            description="Requests from your division will appear here."
          />
        ) : (
          <DecisionTable rows={historyRows} showDecision />
        )}
      </Card>

      <PageSuccessModal
        open={Boolean(success)}
        title={success?.title ?? ""}
        message={success?.message}
        dismissHref="/supervisor"
      />
    </>
  );
}
