# Login – Design

> **How it is built.** This document turns the requirements into a plan a
> builder (person or AI) can follow without asking the business again.
> [01-requirements.md](01-requirements.md) is the source of truth for
> *behaviour*; if the two disagree, fix the requirements first, then this file.
>
> - **Part A – Data design** (sections 1–2): **you own and review this.**
> - **Part B – App design** (sections 3–8): the AI drafts this; you check it.

---

# Part A – Data design (you review)

## 1. Tables

The app stores data in one table so far. Every row gets a number (`id`)
automatically. In Session 2 you add the leave request table here.

### `User` – one row per person who can log in

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the user |
| `email` | text | yes, unique | Used to log in, stored in lowercase, e.g. `employee-1@budiman.com` |
| `name` | text | yes | Full name shown on screen, with the division in brackets, e.g. "Employee 1 (Finance & Administration)" |
| `passwordHash` | text | yes | Scrambled password – never the real one |
| `role` | text | yes | `EMPLOYEE`, `SUPERVISOR`, `HR` or `ADMIN` |
| `identificationNo` | text | yes | Staff ID: `00-1` then 5 digits, e.g. `00-148291` |
| `designation` | text | yes | Job title, one of the list in rule 4, e.g. `Administrative Officer` |
| `division` | text | yes | Department, one of the list in rule 4, e.g. `Finance & Administration` |
| `createdAt` | date + time | auto | When the user was created |

> **Why is role plain text?** SQLite (our database) does not support a fixed
> list of choices ("enums"). So the allowed values are listed in
> `src/lib/constants.ts`, and the app checks them.

## 2. Business rules

1. **Emails.** Every email is a company address ending in `@budiman.com`. It is
   stored in lowercase and is unique, so login ignores capitals.
2. **Passwords.** Stored only as a hash (bcrypt). A wrong email and a wrong
   password give the **same** message, so nobody can find out which emails exist.
3. **Roles.** Each user has exactly one role. The role decides which pages they
   can open (§4).
4. **Divisions and designations** are chosen from fixed lists, kept in
   `src/lib/constants.ts`:
   - **Division:** Software Development, Quality Assurance, IT Infrastructure &
     Operations, Cybersecurity, Data & Analytics, Product & Design, Customer
     Support, Human Resources, Finance & Administration, Management.
   - **Designation:** Software Engineer, QA Engineer, System Administrator,
     IT Support Technician, Data Analyst, UI/UX Designer, Team Lead, HR Officer,
     Administrative Officer, Director. The designation is only a job title;
     the role decides what someone can do.
5. **Sessions.** A login lasts 7 days on the same browser, then the user must
   log in again.

---

# Part B – App design (AI drafts, you check)

## 3. Technology

Chosen so everyone can run the app on their own laptop with no extra accounts.

| Part | Choice | In plain words |
|------|--------|----------------|
| Web framework | **Next.js** (App Router) + **TypeScript** | Builds both the screens and the server logic in one project. |
| Database | **SQLite** via **Prisma 6** | The database is a single file; Prisma lets the code read and write it. |
| Login | Signed **session cookie** | After login the browser keeps a signed note saying who you are (7 days). JavaScript on the page can't read it (`httpOnly`). |
| Passwords | **bcryptjs** | Stores a scrambled version of each password. |
| Styling | **Tailwind CSS v4** | Styles are written as class names, e.g. `text-sm`. No config file needed. |
| Buttons and forms | **Server actions** | Pressing a button calls a function on the server, which checks the user before doing anything. There are no separate `/api` routes. |

## 4. Screens (routes)

After login, each user is sent to their role's home page. Opening a page for
another role sends you back to your own home page.

| Route | Who | What it shows |
|-------|-----|---------------|
| `/` | anyone | Sends you to your home page, or to `/login`. |
| `/login` | anyone | Email and password form. A logged-in user is sent to their home page. |
| `/employee` | Employee | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/supervisor` | Supervisor | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/hr` | HR | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/admin` | Admin | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |

A page that doesn't exist shows **Not found**, with a button back to your
home page.

**Layout:** no sidebar. A top bar across every page shows the app name
(Budiman HRMS) on the left. On the right it shows who is logged in (name and
role) and a **Log out** button. On a phone it shows the user's initials
instead of the name and role. The page below the top bar is empty apart from a short hint line.

**Feedback:** **Log out** opens a confirmation box first. Errors are shown in
red above the form.

## 5. Where the code lives

| Folder / file | What's in it |
|---------------|--------------|
| `prisma/schema.prisma` | The tables from Part A. |
| `prisma/migrations/` | Steps that create the tables. |
| `prisma/seed.ts` | The demo users (§6). |
| `src/lib/constants.ts` | Roles, divisions, designations, time zone, date helpers. |
| `src/lib/auth.ts` | Login cookie, `getCurrentUser()`, `requireRole()`, `roleHome()`. |
| `src/lib/db.ts` | The single database connection. |
| `src/app/actions.ts` | Server actions: `loginAction`, `logoutAction`. |
| `src/app/login/` | The login page. |
| `src/app/<role>/` | One folder per role's screens (pages with only a hint for now). |
| `src/components/` | Screen pieces: app frame (top bar), login form and log out button. |
| `src/components/ui/` | Small building blocks used everywhere: Button, Card, PageHeader, EmptyState, Avatar, Icons, form field styles, dialogs, and the overlay page scrollbar. Use these when you build the module. |
| `src/app/globals.css` | Brand colours (the `brand-…` and `navy` colours). Change them here. |

## 6. Demo data

`npm run db:seed` deletes all users and creates:

| Email (`@budiman.com`) | Name | Role | ID no. | Designation | Division |
|----------|------|------|--------|-------------|----------|
| `employee-1@` | Employee 1 (Finance & Administration) | Employee | 00-148291 | Administrative Officer | Finance & Administration |
| `employee-2@` | Employee 2 (Software Development) | Employee | 00-173604 | Software Engineer | Software Development |
| `supervisor-1@` | Supervisor 1 (Finance & Administration) | Supervisor | 00-159827 | Team Lead | Finance & Administration |
| `supervisor-2@` | Supervisor 2 (Software Development) | Supervisor | 00-126418 | Team Lead | Software Development |
| `hr-1@` | HR 1 (Human Resources) | HR | 00-191356 | HR Officer | Human Resources |
| `hr-2@` | HR 2 (Human Resources) | HR | 00-184072 | HR Officer | Human Resources |
| `admin@` | Admin (Management) | Admin | 00-105739 | Director | Management |

All use the password `password123` (workshop only). There are two users for
each of Employee, Supervisor and HR, in different divisions, so the module you
build can be tested with more than one person per role.

## 7. Security (in plain words)

- Every page checks who is logged in and their role (`requireRole`).
- Every server action checks again on the server – hiding a button is not enough.
- The login cookie is signed with `AUTH_SECRET` from `.env`, so it can't be faked.
- Passwords are stored only as a hash.

## 8. Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm run db:migrate` | Create or update the database tables |
| `npm run db:seed` | Reset the demo users |
| `npm run db:studio` | Open a browser view of the database |
| `npm run lint` | Check the code for common mistakes |
| `npm run build` | Check the whole app compiles |

---

# Leave Request – Design

> **How the module is built.** Follows
> [01-requirements.md](01-requirements.md) sections 6–10; if the two
> disagree, fix the requirements first, then this file.
>
> - **Part A – Data design** (sections 9–10): **you own and review this.**
> - **Part B – App design** (sections 11–15): the AI drafts it; you check it.

---

# Part A – Data design for the Leave Request (you review)

## 9. Tables

One new table. The `User` table (§1) stays as it is. Every row gets a
number (`id`) automatically.

### `LeaveRequest` – one row = one leave request by one employee

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the request |
| `employeeId` | number | yes | Who applied (link to `User`) |
| `supervisorId` | number | yes | The chosen supervisor (link to `User`); must be in the employee's own division |
| `leaveType` | text | yes | `ANNUAL`, `SICK`, `URGENT` or `UNPAID` |
| `startDate` | date | yes | First day of leave |
| `endDate` | date | yes | Last day of leave; never before `startDate` |
| `workingDays` | number | yes | Count of days from start to end **excluding Saturdays and Sundays**, counted when the request is submitted and re-counted when it is resubmitted. At least 1 |
| `reason` | text | no | The employee's own explanation, free text |
| `status` | text | yes | `WAITING_SUPERVISOR`, `READY_TO_SEND`, `WAITING_HR`, `APPROVED` or `REJECTED` |
| `supervisorRemark` | text | no | What the supervisor wrote when rejecting. Empty when they sign |
| `hrRemark` | text | no | What the HR officer wrote when rejecting. Empty when they approve |
| `hrDecidedById` | number | no | The HR officer who approved or rejected (null until HR decides) |
| `createdAt` | date + time | auto | When the request was created |
| `updatedAt` | date + time | auto | Last change; lists sort by this, newest first |

> **Why plain text again?** Like roles, `leaveType` and `status` are fixed
> lists kept in `src/lib/constants.ts`; SQLite has no enums and the app
> checks the values.

## 10. Business rules for leave requests

1. **Valid values.** `leaveType` and `status` may only hold the values
   listed in §9. The allowed-value lists live in `src/lib/constants.ts`.
2. **Dates.** `endDate` is on or after `startDate`. The counted
   `workingDays` must be at least 1 — a request that covers only a weekend
   is refused with a clear message.
3. **Supervisor choice.** `supervisorId` must be a user with the SUPERVISOR
   role in the **same division** as the employee. The form only offers
   those; the server checks it again on save.
4. **Who may do what, and the only allowed status changes:**

   | Actor | Allowed action | Only when | Sets status to |
   |-------|----------------|-----------|----------------|
   | Employee (owner) | Create | always | `WAITING_SUPERVISOR` |
   | The assigned supervisor | Sign | status `WAITING_SUPERVISOR` and they are the assignee | `READY_TO_SEND` |
   | The assigned supervisor | Reject + remark | same as Sign | `REJECTED` |
   | Employee (owner) | Send to HR | status `READY_TO_SEND` | `WAITING_HR` |
   | Any HR officer | Approve | status `WAITING_HR` | `APPROVED` + records themselves in `hrDecidedById` |
   | Any HR officer | Reject + remark | status `WAITING_HR` | `REJECTED` + records themselves in `hrDecidedById` |
   | Employee (owner) | Edit & resubmit | status `REJECTED` | `WAITING_SUPERVISOR` |
   | Admin | nothing (read-only) | – | – |

   No other change is possible, and only these actors may make it — the
   server re-checks role, ownership and current status on every action.
5. **Remarks.** A rejection (by supervisor or HR) always carries a
   non-empty remark. Sign and approve do not use remarks. On
   **edit & resubmit**, `supervisorRemark`, `hrRemark` and `hrDecidedById`
   are cleared, so a request never shows a stale remark from a previous
   round.
6. **Edit & resubmit fields.** The employee may change leave type, dates,
   supervisor and reason; `workingDays` is re-counted and the status goes
   back to `WAITING_SUPERVISOR`. Approved requests can never be edited.
7. **Nothing is deleted.** Approved and Rejected requests stay in the
   database and in the history lists forever (within this app).

---

# Part B – App design for the Leave Request (AI drafts, you check)

## 11. Screens (routes)

The login routes (§4) stay. The four role home pages get real content, and
the employee gets two new screens. The top bar and the "opening another
role's page sends you home" rule are unchanged.

| Route | Who | What it shows |
|-------|-----|---------------|
| `/employee` | Employee | **Needs your action**: *Ready to Send* (button **Send to HR**) and *Rejected* (button **Edit & resubmit**). Below, **History**: every own request, newest first. Top-right button **New leave request**. |
| `/employee/new` | Employee | The apply form (see §12). |
| `/employee/requests/[id]` | Employee (owner) | View one own request; when *Rejected*, an **Edit & resubmit** button opens the same form, prefilled. |
| `/supervisor` | Supervisor | **Needs your action**: own requests with status *Waiting for Supervisor*; buttons **Sign** / **Reject**. Below, **History**: all requests ever sent to them, newest first. |
| `/hr` | HR | **Needs your action**: the shared queue — every *Waiting for HR* request; buttons **Approve** / **Reject**. Below, **History**: every decided request, with the deciding officer shown. |
| `/admin` | Admin | One table of every request, newest first. **No action buttons anywhere.** |

Feedback on every page: each action (Submit, Sign, Reject, Send to HR,
Approve, Edit & resubmit) opens a **confirmation box first** (the existing
`ConfirmDialog`) and shows a **success message** after (the existing
`SuccessModal`). Errors show in red above the form or inside the dialog.
Empty action lists show an `EmptyState` ("Nothing needs your action").

## 12. The apply / edit form

One form used by `/employee/new` and by the edit screen, built from
`src/components/ui/Field`:

- **Leave type** – dropdown of Annual, Sick, Urgent, Unpaid.
- **Start date** and **End date** – date pickers; end before start shows a
  red error, weekend-only range says "These dates contain no working days".
- **Working days** – a read-only count shown under the dates, updated as
  the dates change (server recomputes and checks on save).
- **Supervisor** – dropdown listing only SUPERVISOR users of the
  employee's own division.
- **Reason** – optional text area.
- **Submit** – confirmation box → save → success message → back to
  `/employee`.

## 13. Table columns per screen

| Screen | Columns |
|--------|---------|
| Employee (action & history) | Submitted on, Type, Dates (start–end), Days, Status, Remarks |
| Supervisor action list | Employee, Designation, Dates, Days, Type, Reason |
| Supervisor history | the above + Your decision (signed/rejected) |
| HR queue | Employee, Division, Dates, Days, Type, Reason |
| HR history | the above + Status, Decided by, Remarks |
| Admin | Employee, Division, Supervisor, Type, Dates, Days, Status, Remarks, Decided by |

Tables reuse the `ui/` components and scroll on small screens. Statuses are
shown in plain words ("Waiting for Supervisor"), not raw codes.

## 14. Where the code lives (new/changed files)

| File | What goes in it |
|------|-----------------|
| `prisma/schema.prisma` + new migration | The `LeaveRequest` table (§9). |
| `prisma/seed.ts` | Keeps the 7 users; adds sample requests (§16). |
| `src/lib/constants.ts` | Adds `LEAVE_TYPES`, `LEAVE_STATUSES` and their display names; weekend definition (Sat, Sun). |
| `src/lib/leave.ts` *(new)* | Counting working days, form validation, and "what may this user do to this request right now" (rules from §10 in one place). |
| `src/app/leave-actions.ts` *(new)* | Server actions: `createLeaveRequest`, `signLeave`, `rejectBySupervisor`, `sendToHr`, `approveLeave`, `rejectByHr`, `resubmitLeave`. Every one calls `requireRole` and re-checks ownership/assignment and the current status before saving. |
| `src/app/employee/` | Home page sections + `new/` form + `requests/[id]/` view & edit. |
| `src/app/supervisor/`, `src/app/hr/`, `src/app/admin/` | Home pages from §11. |
| `src/components/leave/` *(new)* | `LeaveForm`, `RequestTable`, `RequestActions`, `DecisionDialog` (remark box used by both rejects). Reuse `src/components/ui/` everywhere. |

## 15. Security for the module

- Every page calls `requireRole` at the top, as login pages do.
- Every server action re-checks on the server: logged in, right role, owner
  or assignee or HR as the rule requires, and the exact status the action
  needs. Hiding a button is not enough.
- `hrDecidedById` comes from the session, never from the form.
- Rejection remarks must be non-empty **server-side**, not just in the form.

## 16. Demo data (sample requests)

`npm run db:seed` keeps deleting and recreating the 7 users, and adds
sample requests so every screen has something to show — at least one
request in **each status**, covering both divisions:

| Request | Status at seed |
|---------|----------------|
| employee-1 → supervisor-1 | Waiting for Supervisor (Annual, a future Mon–Fri) |
| employee-1 → supervisor-1 | Ready to Send |
| employee-1 → supervisor-1 | Waiting for HR |
| employee-1 → supervisor-1 | Approved (decided by HR 1) |
| employee-2 → supervisor-2 | Waiting for Supervisor (Sick) |
| employee-2 → supervisor-2 | Rejected by supervisor-2, with a remark |

Sample data uses made-up dates and remarks only. The acceptance checks in
requirements §9 create their own requests, so samples never clash with them.
