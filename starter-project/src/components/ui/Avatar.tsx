// A round badge with a person's initials. The colour is picked from the name,
// so the same person always gets the same colour.

const COLORS = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-800",
];

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part && part[0] === part[0].toUpperCase() && /[A-Za-z]/.test(part[0]))
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function colorFor(name: string): string {
  let total = 0;
  for (const char of name) total += char.charCodeAt(0);
  return COLORS[total % COLORS.length];
}

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({ name, size = "md" }: { name: string; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${SIZES[size]} ${colorFor(name)}`}
    >
      {initials(name)}
    </span>
  );
}
