import { requireRole } from "@/lib/auth";

// The Employee home page: a page with only a short hint for now. Only Employee users can open it
// (design §5).
export default async function EmployeePage() {
  await requireRole("EMPLOYEE");

  return (
    <p className="text-sm text-slate-400">
      This page is empty. Continue here with your own project, for example the Leave Request module.
    </p>
  );
}
