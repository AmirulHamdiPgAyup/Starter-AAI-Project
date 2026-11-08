import Link from "next/link";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { Avatar } from "./ui/Avatar";
import { LogoutButton } from "./LogoutButton";

// The frame around every page: a top bar, then the page. The top bar shows the
// app name, who is logged in, and Log out (design §4).
// Logged-out visitors (the login page) get the page on its own, with no frame.
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return <main className="min-h-screen">{children}</main>;

  const role = user.role as Role;
  const roleLabel = ROLE_LABELS[role] ?? user.role;

  return (
    <div className="min-h-screen bg-slate-50">
      <header data-app-header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:h-16 md:px-8">
        <Link href={roleHome(role)} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white shadow-sm">
            B
          </span>
          <span className="text-sm font-semibold text-slate-900">Budiman HRMS</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Who is logged in: initials on a phone, name and role on larger screens. */}
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{roleLabel}</p>
          </div>
          <span title={`${user.name} · ${roleLabel}`}>
            <Avatar name={user.name} size="sm" />
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">{children}</main>
    </div>
  );
}
