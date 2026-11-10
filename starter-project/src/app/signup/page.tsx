import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { isRole } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { SignupForm } from "@/components/SignupForm";

export const metadata = { title: "Sign up · Budiman HRMS" };

// Self sign-up (design §12b, U13). The account is always an Employee; the
// division dropdown lists the divisions already in the system so supervisor
// matching keeps working.
export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user && isRole(user.role)) redirect(roleHome(user.role));

  const rows = await prisma.user.findMany({
    where: { division: { not: "" } },
    distinct: ["division"],
    orderBy: { division: "asc" },
    select: { division: true },
  });
  const divisions = rows.map((r) => r.division);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
              B
            </span>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Budiman HRMS</h1>
              <p className="text-sm text-slate-500">Create your Employee account.</p>
            </div>
          </div>

          <div className="mt-8">
            <SignupForm divisions={divisions} />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
