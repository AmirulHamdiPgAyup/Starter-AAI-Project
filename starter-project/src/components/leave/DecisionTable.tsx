// Shared queue/history table for the supervisor and HR screens (design §13).
// Supervisor rows carry Designation; HR rows carry Division instead. The
// history tables pass the extra flags for their columns ("Your decision",
// or Status / Decided by / Remarks). Rows are prepared by the server page.

import type { LeaveStatus } from "@/lib/constants";
import { StatusPill } from "./RequestTable";

export interface DecisionRow {
  id: number;
  employee: string;
  designation?: string; // supervisor screens
  division?: string; // HR screens
  dates: string; // formatLeaveDates(start, end)
  days: string; // leaveDaysLabel(workingDays)
  type: string; // display label
  reason: string | null;
  decision?: string; // supervisor history ("Signed" / "Rejected" / "—")
  status?: LeaveStatus; // HR history
  statusLabel?: string;
  decidedBy?: string | null; // HR history: the deciding officer
  remark?: string | null; // HR history
  action?: React.ReactNode;
}

const TH =
  "whitespace-nowrap border-b border-slate-100 bg-slate-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const TD = "px-5 py-3 align-top text-slate-700";

export function DecisionTable({
  rows,
  showDecision = false,
  showStatus = false,
  showDecidedBy = false,
  showRemarks = false,
}: {
  rows: DecisionRow[];
  showDecision?: boolean;
  showStatus?: boolean;
  showDecidedBy?: boolean;
  showRemarks?: boolean;
}) {
  const withActions = rows.some((r) => r.action !== undefined);
  const useDivision = rows.some((r) => r.division !== undefined);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr>
            <th className={TH}>Employee</th>
            <th className={TH}>{useDivision ? "Division" : "Designation"}</th>
            <th className={TH}>Dates</th>
            <th className={TH}>Days</th>
            <th className={TH}>Type</th>
            <th className={TH}>Reason</th>
            {showDecision ? <th className={TH}>Your decision</th> : null}
            {showStatus ? <th className={TH}>Status</th> : null}
            {showDecidedBy ? <th className={TH}>Decided by</th> : null}
            {showRemarks ? <th className={TH}>Remarks</th> : null}
            {withActions ? <th className={TH}>Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={TD}>{r.employee}</td>
              <td className={TD}>
                {useDivision ? r.division ?? "—" : r.designation ?? "—"}
              </td>
              <td className={TD}>{r.dates}</td>
              <td className={TD}>{r.days}</td>
              <td className={TD}>{r.type}</td>
              <td className={TD}>{r.reason ?? "—"}</td>
              {showDecision ? <td className={TD}>{r.decision ?? "—"}</td> : null}
              {showStatus ? (
                <td className={TD}>
                  {r.status ? (
                    <StatusPill status={r.status} label={r.statusLabel ?? r.status} />
                  ) : (
                    "—"
                  )}
                </td>
              ) : null}
              {showDecidedBy ? <td className={TD}>{r.decidedBy ?? "—"}</td> : null}
              {showRemarks ? <td className={TD}>{r.remark ?? "—"}</td> : null}
              {withActions ? <td className={TD}>{r.action}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
