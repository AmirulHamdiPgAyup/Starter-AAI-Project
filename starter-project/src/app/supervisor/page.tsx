import { requireRole } from "@/lib/auth";

// The Supervisor home page: a page with only a short hint for now. Only Supervisor users can open it
// (design §5).
export default async function SupervisorPage() {
  await requireRole("SUPERVISOR");

  return (
    <p className="text-sm text-slate-400">
      This page is empty. Continue here with your own project, for example the Leave Request module.
    </p>
  );
}
