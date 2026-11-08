export type DetailRow = { label: string; value: React.ReactNode; wide?: boolean };

// A list of label/value pairs, e.g. on the request page. Two columns by
// default; pass columns={1} for narrow panels that need one field per row.
// Rows marked `wide` take the full width (useful for long text like a reason).
export function DetailList({ rows, columns = 2 }: { rows: DetailRow[]; columns?: 1 | 2 }) {
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {rows.map((row) => (
        <div key={row.label} className={row.wide ? "sm:col-span-2" : undefined}>
          <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
          <dd className="mt-0.5 text-sm text-slate-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
