import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

// Shown when a page or request doesn't exist, or you aren't allowed to see it.
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        This page or request doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link href="/" className={`${buttonClasses("secondary")} mt-6`}>
        Go to my home page
      </Link>
    </div>
  );
}
