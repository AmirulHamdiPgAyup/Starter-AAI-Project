// Shared styles for form fields, so every input looks the same.

const FIELD_BASE =
  "mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400";

// The classes for an input. Pass `true` to outline it in red (a required field
// that was left empty).
export function fieldClass(invalid = false): string {
  return invalid
    ? `${FIELD_BASE} border-red-400 ring-2 ring-red-500/15 focus:border-red-500 focus:ring-red-500/20`
    : `${FIELD_BASE} border-slate-300 focus:border-brand-500 focus:ring-brand-500/20`;
}

export const inputClass = fieldClass();

export const checkboxClass =
  "h-4 w-4 rounded border-slate-300 accent-brand-600 focus:ring-brand-500";

export function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

export function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-slate-500">{children}</p>;
}

// A red box for error messages from the server.
export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  );
}
