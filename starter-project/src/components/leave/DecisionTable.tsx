// Table for the supervisor queue and history (design §13: Employee,
// Designation, Dates, Days, Type, Reason, plus "Your decision" on the
// history table). Rows are prepared by the server page.

export interface DecisionRow {
  id: number;
  employee: string;
  designation: string;
  dates: string; // formatLeaveDates(start, end)
  days: string; // leaveDaysLabel(workingDays)
  type: string; // display label
  reason: string | null;
  decision?: string; // only for history ("Signed" / "Rejected" / "—")
  action?: React.ReactNode;
}

const TH =
  "whitespace-nowrap border-b border-slate-100 bg-slate-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const TD = "px-5 py-3 align-top text-slate-700";

export function DecisionTable({
  rows,
  showDecision = false,
}: {
  rows: DecisionRow[];
  showDecision?: boolean;
}) {
  const withActions = rows.some((r) => r.action !== undefined);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr>
            <th className={TH}>Employee</th>
            <th className={TH}>Designation</th>
            <th className={TH}>Dates</th>
            <th className={TH}>Days</th>
            <th className={TH}>Type</th>
            <th className={TH}>Reason</th>
            {showDecision ? <th className={TH}>Your decision</th> : null}
            {withActions ? <th className={TH}>Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={TD}>{r.employee}</td>
              <td className={TD}>{r.designation}</td>
              <td className={TD}>{r.dates}</td>
              <td className={TD}>{r.days}</td>
              <td className={TD}>{r.type}</td>
              <td className={TD}>{r.reason ?? "—"}</td>
              {showDecision ? <td className={TD}>{r.decision ?? "—"}</td> : null}
              {withActions ? <td className={TD}>{r.action}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
