import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "next/link";
import { LeaveForm } from "@/components/leave/LeaveForm";

export const metadata = { title: "New leave request · Budiman HRMS" };

// The apply screen (design §11–12). Only Employees; the supervisor dropdown
// lists supervisors of the employee's own division (design §10.3).
export default async function NewLeaveRequestPage() {
  const user = await requireRole("EMPLOYEE");

  const supervisors = await prisma.user.findMany({
    where: { role: "SUPERVISOR", division: user.division },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="New leave request"
        description={`Apply to a supervisor in ${user.division}.`}
      />

      {supervisors.length === 0 ? (
        <Card>
          <EmptyState
            title="No supervisors in your division"
            description="Ask HR to add a supervisor for your division before you can apply."
          />
          <div className="px-5 pb-5 text-center">
            <Link href="/employee" className={buttonClasses("secondary")}>
              Back to my requests
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-5 sm:p-6">
          <LeaveForm supervisors={supervisors} />
        </Card>
      )}
    </div>
  );
}
