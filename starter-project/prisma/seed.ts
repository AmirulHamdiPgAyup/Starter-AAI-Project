import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// The demo users (design §6). Every one logs in with the password "password123".
// Each name includes the user's division in brackets.
const USERS = [
  { email: "employee-1@budiman.com", name: "Employee 1 (Finance & Administration)", role: "EMPLOYEE", identificationNo: "00-148291", designation: "Administrative Officer", division: "Finance & Administration" },
  { email: "employee-2@budiman.com", name: "Employee 2 (Software Development)", role: "EMPLOYEE", identificationNo: "00-173604", designation: "Software Engineer", division: "Software Development" },
  { email: "supervisor-1@budiman.com", name: "Supervisor 1 (Finance & Administration)", role: "SUPERVISOR", identificationNo: "00-159827", designation: "Team Lead", division: "Finance & Administration" },
  { email: "supervisor-2@budiman.com", name: "Supervisor 2 (Software Development)", role: "SUPERVISOR", identificationNo: "00-126418", designation: "Team Lead", division: "Software Development" },
  { email: "hr-1@budiman.com", name: "HR 1 (Human Resources)", role: "HR", identificationNo: "00-191356", designation: "HR Officer", division: "Human Resources" },
  { email: "hr-2@budiman.com", name: "HR 2 (Human Resources)", role: "HR", identificationNo: "00-184072", designation: "HR Officer", division: "Human Resources" },
  { email: "admin@budiman.com", name: "Admin (Management)", role: "ADMIN", identificationNo: "00-105739", designation: "Director", division: "Management" },
];

// Sample leave requests (design §16): one per status, both divisions, so
// every screen has something to show. Made-up dates and remarks only.
const LEAVE_REQUESTS: Array<{
  employee: string;
  supervisor: string;
  leaveType: string;
  startDate: string; // YYYY-MM-DD (midnight UTC)
  endDate: string;
  workingDays: number;
  reason: string | null;
  status: string;
  supervisorRemark: string | null;
  hrRemark: string | null;
  hrDecidedBy: string | null;
}> = [
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "ANNUAL", startDate: "2026-11-16", endDate: "2026-11-20", workingDays: 5, reason: "Annual family visit.", status: "WAITING_SUPERVISOR", supervisorRemark: null, hrRemark: null, hrDecidedBy: null },
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "UNPAID", startDate: "2026-11-23", endDate: "2026-11-25", workingDays: 3, reason: "Attending a wedding overseas.", status: "READY_TO_SEND", supervisorRemark: null, hrRemark: null, hrDecidedBy: null },
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "URGENT", startDate: "2026-11-30", endDate: "2026-12-01", workingDays: 2, reason: "Urgent personal matter.", status: "WAITING_HR", supervisorRemark: null, hrRemark: null, hrDecidedBy: null },
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "ANNUAL", startDate: "2026-12-07", endDate: "2026-12-11", workingDays: 5, reason: "Year-end break with family.", status: "APPROVED", supervisorRemark: null, hrRemark: null, hrDecidedBy: "hr-1@budiman.com" },
  { employee: "employee-2@budiman.com", supervisor: "supervisor-2@budiman.com", leaveType: "SICK", startDate: "2026-11-17", endDate: "2026-11-18", workingDays: 2, reason: "Not feeling well.", status: "WAITING_SUPERVISOR", supervisorRemark: null, hrRemark: null, hrDecidedBy: null },
  { employee: "employee-2@budiman.com", supervisor: "supervisor-2@budiman.com", leaveType: "URGENT", startDate: "2026-11-25", endDate: "2026-11-27", workingDays: 3, reason: "To attend a family event.", status: "REJECTED", supervisorRemark: "Team is short-handed that week. Please pick different dates.", hrRemark: null, hrDecidedBy: null },
];

async function main() {
  // Reset the data so the seed is repeatable. Requests first (they link to users).
  await prisma.leaveRequest.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  for (const user of USERS) {
    await prisma.user.create({ data: { ...user, passwordHash } });
  }

  const usersByEmail = new Map(
    (await prisma.user.findMany()).map((u) => [u.email, u.id]),
  );
  for (const r of LEAVE_REQUESTS) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: usersByEmail.get(r.employee)!,
        supervisorId: usersByEmail.get(r.supervisor)!,
        leaveType: r.leaveType,
        startDate: new Date(`${r.startDate}T00:00:00Z`),
        endDate: new Date(`${r.endDate}T00:00:00Z`),
        workingDays: r.workingDays,
        reason: r.reason,
        status: r.status,
        supervisorRemark: r.supervisorRemark,
        hrRemark: r.hrRemark,
        hrDecidedById: r.hrDecidedBy ? usersByEmail.get(r.hrDecidedBy)! : null,
      },
    });
  }

  console.log(`Seeded ${USERS.length} demo users (password: password123):`);
  for (const user of USERS) console.log(`  ${user.email.padEnd(26)} ${user.role}`);
  console.log(`Seeded ${LEAVE_REQUESTS.length} sample leave requests:`);
  for (const r of LEAVE_REQUESTS)
    console.log(`  ${r.employee.padEnd(26)} ${r.leaveType.padEnd(6)} ${r.status}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
