import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { LeaveForm } from "@/components/leave/LeaveForm";

export const metadata = { title: "Edit leave request · Budiman HRMS" };

// The edit & resubmit screen (design §11–12): the apply form reopens
// prefilled and Submit calls resubmitLeave. Only the owner gets here, and
// only while the request is Rejected — any other status is sent back to the
// request view, which decides whether editing is offered at all.
export default async function EditLeaveRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.employeeId !== user.id) notFound();
  if (request.status !== "REJECTED") redirect(`/employee/requests/${request.id}`);

  const supervisors = await prisma.user.findMany({
    where: { role: "SUPERVISOR", division: user.division },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Edit leave request"
        description="Fix the request and send it back to your supervisor."
      />

      {supervisors.length === 0 ? (
        <Card>
          <EmptyState
            title="No supervisors in your division"
            description="Ask HR to add a supervisor for your division before you can resubmit."
          />
          <div className="px-5 pb-5 text-center">
            <Link
              href={`/employee/requests/${request.id}`}
              className={buttonClasses("secondary")}
            >
              Back to the request
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-5 sm:p-6">
          <LeaveForm
            supervisors={supervisors}
            request={{
              id: request.id,
              leaveType: request.leaveType,
              startDate: request.startDate.toISOString().slice(0, 10),
              endDate: request.endDate.toISOString().slice(0, 10),
              supervisorId: request.supervisorId,
              reason: request.reason,
            }}
          />
        </Card>
      )}
    </div>
  );
}
