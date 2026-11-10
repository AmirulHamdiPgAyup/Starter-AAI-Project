import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  isLeaveStatus,
  isLeaveType,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  type LeaveStatus,
} from "@/lib/constants";
import { formatLeaveDates, leaveDaysLabel } from "@/lib/leave";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/leave/RequestTable";

export const metadata = { title: "All leave requests · Budiman HRMS" };

const TH =
  "whitespace-nowrap border-b border-slate-100 bg-slate-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const TD = "px-5 py-3 align-top text-slate-700";

// The Admin home (design §11): one table of every request, newest first,
// with the columns from design §13. This is a plain server table — no client
// components, no RequestActions — so no action button can ever appear here
// (AC-22). Admins see everything and change nothing.
export default async function AdminPage() {
  await requireRole("ADMIN");

  const requests = await prisma.leaveRequest.findMany({
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    include: {
      employee: { select: { name: true, division: true } },
      supervisor: { select: { name: true } },
      hrDecidedBy: { select: { name: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="All leave requests"
        description="Every request in the company, newest first. This view is read-only."
      />

      <Card>
        <CardHeader title="All requests" count={requests.length} />
        {requests.length === 0 ? (
          <EmptyState
            title="No leave requests yet"
            description="Requests made by employees will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr>
                  <th className={TH}>Employee</th>
                  <th className={TH}>Division</th>
                  <th className={TH}>Supervisor</th>
                  <th className={TH}>Type</th>
                  <th className={TH}>Dates</th>
                  <th className={TH}>Days</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Remarks</th>
                  <th className={TH}>Decided by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => {
                  const status: LeaveStatus = isLeaveStatus(r.status)
                    ? r.status
                    : "WAITING_SUPERVISOR";
                  // The last remark written (design §10.5).
                  const remark = r.hrRemark ?? r.supervisorRemark;
                  return (
                    <tr key={r.id}>
                      <td className={TD}>{r.employee.name}</td>
                      <td className={TD}>{r.employee.division}</td>
                      <td className={TD}>{r.supervisor.name}</td>
                      <td className={TD}>
                        {isLeaveType(r.leaveType)
                          ? LEAVE_TYPE_LABELS[r.leaveType]
                          : r.leaveType}
                      </td>
                      <td className={TD}>{formatLeaveDates(r.startDate, r.endDate)}</td>
                      <td className={TD}>{leaveDaysLabel(r.workingDays)}</td>
                      <td className={TD}>
                        <StatusPill
                          status={status}
                          label={LEAVE_STATUS_LABELS[status]}
                        />
                      </td>
                      <td className={TD}>{remark ?? "—"}</td>
                      <td className={TD}>{r.hrDecidedBy?.name ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
