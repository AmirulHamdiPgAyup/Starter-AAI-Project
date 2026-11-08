import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { isRole } from "@/lib/constants";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Log in · Budiman HRMS" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user && isRole(user.role)) redirect(roleHome(user.role));

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
              B
            </span>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Budiman HRMS</h1>
              <p className="text-sm text-slate-500">Log in to manage your leave.</p>
            </div>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
