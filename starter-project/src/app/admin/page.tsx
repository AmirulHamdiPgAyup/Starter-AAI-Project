import { requireRole } from "@/lib/auth";

// The Admin home page: a page with only a short hint for now. Only Admin users can open it
// (design §5).
export default async function AdminPage() {
  await requireRole("ADMIN");

  return (
    <p className="text-sm text-slate-400">
      This page is empty. Continue here with your own project, for example the Leave Request module.
    </p>
  );
}
