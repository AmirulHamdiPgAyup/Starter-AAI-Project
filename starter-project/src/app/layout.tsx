import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { OverlayScrollbar } from "@/components/ui/OverlayScrollbar";

export const metadata: Metadata = {
  title: "Budiman HRMS · Leave",
  description: "Starter app for the Agentic AI workshop project: login for all four roles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">
        <AppShell>{children}</AppShell>
        <OverlayScrollbar />
      </body>
    </html>
  );
}
