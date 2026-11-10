# Login – Tasks

> **In what order, and how to check.** Build one task at a time, in order.
> After each task: the AI builds it → a reviewer agent tests it → **you check it
> in the browser**.
>
> If a check fails, **fix the spec first** (requirements or design), then ask
> the AI to rebuild. The requirements and design are the source of truth.
>
> These tasks are **already done** in the starter app – they show what a task
> list looks like. In Session 2, add the Leave Request tasks after Task 6.

**Core and Stretch.** **Core** tasks must be finished first: the app is not
usable without them. **Stretch** tasks are nice extras. Do them only if time is
left, and only if you ask for them. All the login tasks are Core, because login
has to work before anything else.

**Before you start:** `npm install`, then `cp .env.example .env`
(Windows: `copy .env.example .env`).

| # | Task | Core / Stretch | Checks (from requirements §4) |
|---|------|----------------|-------------------------------|
| 1 | Set up the app | Core | – |
| 2 | Database table and demo users | Core | – |
| 3 | Log in and log out | Core | AC-01, AC-02, AC-03, AC-06 |
| 4 | Role protection and home pages | Core | AC-04, AC-05, AC-07 |
| 5 | Top bar | Core | AC-08, AC-09 |
| 6 | Final check and README | Core | All |

---

## Task 1 – Set up the app *(Core)*

- **Goal:** A Next.js + TypeScript app with Tailwind CSS that starts.
- **Files:** `package.json`, `next.config.ts`, `tsconfig.json`,
  `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
  (starts with `@import "tailwindcss";` – no Tailwind config file needed).
- **Check:** `npm run dev` starts, and http://localhost:3000 shows a page.

## Task 2 – Database table and demo users *(Core)*

- **Goal:** Prisma with SQLite, the `User` table from design Part A, and the
  demo users from design §6 with hashed passwords.
- **Files:** `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`,
  `src/lib/db.ts`, `src/lib/constants.ts`, `.env.example`, the `db:seed`
  script in `package.json`.
- **Check:** `npm run db:migrate` creates `prisma/dev.db`. `npm run db:seed`
  prints the 7 demo users, and `npm run db:studio` shows them.

## Task 3 – Log in and log out *(Core)*

- **Goal:** Login page, signed session cookie, and logout with a confirmation
  box. After login, go to the role's home page.
- **Files:** `src/lib/auth.ts` (`getCurrentUser`, `startSession`, `endSession`,
  `roleHome`), `src/app/actions.ts` (`loginAction`, `logoutAction`),
  `src/app/login/page.tsx`, `src/components/LoginForm.tsx`,
  `src/components/LogoutButton.tsx`, `src/components/ui/` (Button, Field,
  dialogs).
- **Check:** AC-01, AC-02, AC-03, AC-06.

## Task 4 – Role protection and home pages *(Core)*

- **Goal:** A `requireRole(...)` helper used at the top of every page, so each
  role sees only its own screens, and a home page for each role with only a short hint line.
- **Files:** `src/lib/auth.ts`, `src/app/employee/page.tsx`,
  `src/app/supervisor/page.tsx`, `src/app/hr/page.tsx`,
  `src/app/admin/page.tsx`.
- **Check:** AC-04, AC-05, AC-07.

## Task 5 – Top bar *(Core)*

- **Goal:** The top bar from design §4 (app name, who is logged in, **Log
  out**), and the **Not found** page.
- **Files:** `src/components/AppShell.tsx`, `src/components/LogoutButton.tsx`,
  `src/components/ui/`, `src/app/not-found.tsx`.
- **Check:** AC-08, AC-09.

## Task 6 – Final check and README *(Core)*

- **Goal:** Run `npm run db:seed`, then walk through the whole acceptance
  checklist as each role. Make sure `README.md` explains how to install, run
  and test.
- **Check:** Every AC box ticked; `npm run lint` and `npm run build` pass.

---

# Leave Request – Tasks

> Same rules as above: build **one task at a time**, in order. After each:
> the AI builds it → the checks are run → **you check it in the browser**.
> If a check fails, fix the spec first (requirements §6–10 or design §9–16),
> then rebuild. All tasks are **Core** — this module has no Stretch.

| # | Task | Core / Stretch | Checks (from requirements §9) |
|---|------|----------------|-------------------------------|
| 7 | Leave data: table, lists, sample requests | Core | – |
| 8 | Working-days & rules helper | Core | – (proved by Tasks 9–13) |
| 9 | The apply form | Core | AC-10, AC-11, AC-12, AC-13 |
| 10 | Employee home: action + history, Send to HR | Core | AC-17 |
| 11 | Supervisor: Sign / Reject | Core | AC-14, AC-15, AC-16 |
| 12 | HR: shared queue, Approve / Reject | Core | AC-18, AC-19, AC-20 |
| 13 | Employee: Edit & resubmit | Core | AC-21 |
| 14 | Admin: read-only overview | Core | AC-22 |
| 15 | Final check and README | Core | All, incl. AC-23 |

## Task 7 – Leave data: table, lists, sample requests *(Core)*

- **Goal:** The `LeaveRequest` table from design §9 exists, the leave-type
  and status lists are in `constants.ts`, and `npm run db:seed` creates the
  six sample requests from design §16 alongside the 7 users.
- **Files:** `prisma/schema.prisma`, a new folder under
  `prisma/migrations/`, `src/lib/constants.ts`, `prisma/seed.ts`.
- **Check:** `npm run db:migrate` succeeds; `npm run db:seed` prints the
  users and sample requests; `npm run db:studio` shows one request per
  status, both divisions. The app still starts and login still works.

## Task 8 – Working-days & rules helper *(Core)*

- **Goal:** `src/lib/leave.ts` holds: the working-day count (weekends
  excluded, per design rule §10.2), the form validation, and one function
  answering "what may this user do to this request right now" (design §10.4).
- **Files:** `src/lib/leave.ts` (+ additions to `src/lib/constants.ts`).
- **Check:** `npm run lint` passes. The counts for the AC-13 dates
  (Mon–Fri = 5, Fri–Mon = 2, Sat–Sun = 0 refused) are proved in the browser
  at Task 9; nothing else changes yet.

## Task 9 – The apply form *(Core)*

- **Goal:** `/employee/new` with the form from design §12: type dropdown,
  dates with a live working-days count, division-filtered supervisor
  dropdown, optional reason; **Submit** → confirm → success → back to
  `/employee`. Server action `createLeaveRequest` re-checks everything.
- **Files:** `src/app/employee/new/page.tsx`,
  `src/components/leave/LeaveForm.tsx`, `src/app/leave-actions.ts`,
  `src/components/ui/` (reused, not copied).
- **Check:** AC-10, AC-11, AC-12, AC-13.

## Task 10 – Employee home: action + history, Send to HR *(Core)*

- **Goal:** `/employee` shows **Needs your action** (*Ready to Send* with
  **Send to HR**, *Rejected* with an *Edit & resubmit* placeholder until
  Task 13) and **History** (all own requests, newest first, columns from
  design §13). Top bar gets **New leave request**. `sendToHr` server action.
- **Files:** `src/app/employee/page.tsx`,
  `src/components/leave/RequestTable.tsx`, `RequestActions.tsx`,
  `src/app/leave-actions.ts`.
- **Check:** AC-17 (and AC-10's "appears in history" part still holds).

## Task 11 – Supervisor: Sign / Reject *(Core)*

- **Goal:** `/supervisor` with **Needs your action** = own
  *Waiting for Supervisor* requests; **Sign** and **Reject** (remark
  required, in the dialog) with confirm + success; **History** below.
  Server actions `signLeave`, `rejectBySupervisor` re-check assignment and
  status.
- **Files:** `src/app/supervisor/page.tsx`,
  `src/components/leave/DecisionDialog.tsx`, `RequestActions.tsx`,
  `src/app/leave-actions.ts`.
- **Check:** AC-14, AC-15, AC-16.

## Task 12 – HR: shared queue, Approve / Reject *(Core)*

- **Goal:** `/hr` with the shared **Needs your action** queue (all
  *Waiting for HR*), **Approve** and **Reject** (remark required) with
  confirm + success, the deciding officer recorded from the session;
  **History** shows decided requests with *Decided by*.
- **Files:** `src/app/hr/page.tsx`, `src/app/leave-actions.ts`
  (`approveLeave`, `rejectByHr`), reuse `DecisionDialog` / `RequestTable`.
- **Check:** AC-18, AC-19, AC-20.

## Task 13 – Employee: Edit & resubmit *(Core)*

- **Goal:** The request view `/employee/requests/[id]`; when *Rejected*,
  the prefilled form from Task 9 reopens, remarks are cleared,
  working-days re-counted, status back to *Waiting for Supervisor*.
  Server action `resubmitLeave`.
- **Files:** `src/app/employee/requests/[id]/page.tsx` (+ edit),
  `src/app/leave-actions.ts`, reuse `LeaveForm`.
- **Check:** AC-21.

## Task 14 – Admin: read-only overview *(Core)*

- **Goal:** `/admin` lists every request with the columns from design §13
  (including Remarks and Decided by) and **no action buttons**.
- **Files:** `src/app/admin/page.tsx` — a plain server table with the
  design §13 columns, reusing `StatusPill` and the shared table styling
  (`RequestTable`'s columns are the employee screen's and cannot show these).
- **Check:** AC-22.

## Task 15 – Final check and README *(Core)*

- **Goal:** `npm run db:seed`, then walk the whole §9 checklist as each
  role, including the negative checks (AC-11, AC-20, AC-23); confirm the
  login checks (§4) still pass; update `README.md` (new screens, sample
  requests).
- **Check:** Every AC-10…AC-23 box ticked, every old AC still ticked;
  `npm run lint` and `npm run build` pass.

## Task 16 – Self sign-up *(Core, added after the first build)*

- **Goal:** `/signup` (design §12b), linked from the login page: full name,
  work email, password (min. 8 characters) and a division dropdown of the
  divisions that already exist. `signupAction` validates server-side
  (required fields, 8-char password, unique email — duplicate shows
  "An account with this email already exists."), hashes the password with
  bcrypt, **pins the role to EMPLOYEE on the server**, creates the user,
  sets the session cookie and sends the new person to `/employee`. A
  confirm box precedes creating, a success message follows.
- **Files:** `src/app/signup/page.tsx`, `src/app/actions.ts`
  (`signupAction`), login page (Sign up link). Reuse `Field`, `Button`,
  `ConfirmDialog`, `SuccessModal`.
- **Check:** AC-24, AC-25, AC-26; `npm run lint` and `npm run build` pass;
  README mentions the sign-up page.

## Task 17 – hCaptcha human check *(Core, added after the first build)*

- **Goal:** Every login and sign-up must carry a CAPTCHA token that the
  **server** verifies with hCaptcha before credentials are touched
  (design §12c). Missing, wrong or unverifiable tokens (including an
  unreachable verification service) are refused — **fail closed**. The
  widget lives inside each form so its `h-captcha-response` token rides
  along with the submission; the widget resets after every server error
  because tokens are single-use.
- **Files:** `src/lib/captcha.ts` (`verifyHCaptcha`, new),
  `src/components/HCaptcha.tsx` (new), `LoginForm.tsx`, `SignupForm.tsx`,
  the login and sign-up pages (pass the sitekey), `src/app/actions.ts`
  (verify first in `loginAction` and `signupAction`), `.env.example`
  (`HCAPTCHA_SITEKEY`, `HCAPTCHA_SECRET` — test keypair; `.env` stays
  uncommitted).
- **Check:** AC-27, AC-28, AC-29; `npm run lint` and `npm run build` pass;
  README explains the keys and how to force a real visual challenge.
