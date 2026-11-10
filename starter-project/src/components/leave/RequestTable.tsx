import type { LeaveStatus } from "@/lib/constants";

// Shared request table (design §13). Rows are prepared by the server page;
// an optional Actions column carries row buttons (Task 11-14 reuse this).

export interface RequestRow {
  id: number;
  submitted: string; // formatTimestamp(createdAt)
  type: string; // display label
  dates: string; // formatLeaveDates(start, end)
  days: string; // leaveDaysLabel(workingDays)
  status: LeaveStatus;
  statusLabel: string;
  remark: string | null;
  action?: React.ReactNode;
}

const STATUS_PILL: Record<LeaveStatus, string> = {
  WAITING_SUPERVISOR: "bg-amber-100 text-amber-800",
  READY_TO_SEND: "bg-blue-100 text-blue-800",
  WAITING_HR: "bg-violet-100 text-violet-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function StatusPill({ status, label }: { status: LeaveStatus; label: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_PILL[status]}`}>
      {label}
    </span>
  );
}

const TH = "whitespace-nowrap border-b border-slate-100 bg-slate-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const TD = "px-5 py-3 align-top text-slate-700";

export function RequestTable({ rows }: { rows: RequestRow[] }) {
  const withActions = rows.some((r) => r.action !== undefined);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr>
            <th className={TH}>Submitted on</th>
            <th className={TH}>Type</th>
            <th className={TH}>Dates</th>
            <th className={TH}>Days</th>
            <th className={TH}>Status</th>
            <th className={TH}>Remarks</th>
            {withActions ? <th className={TH}>Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={TD}>{r.submitted}</td>
              <td className={TD}>{r.type}</td>
              <td className={TD}>{r.dates}</td>
              <td className={TD}>{r.days}</td>
              <td className={TD}>
                <StatusPill status={r.status} label={r.statusLabel} />
              </td>
              <td className={TD}>{r.remark ?? "—"}</td>
              {withActions ? <td className={TD}>{r.action}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
