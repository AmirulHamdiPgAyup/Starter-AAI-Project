# Login – Requirements

> **What and why.** This document says what the login must do and why. It is
> the source of truth for behaviour: when something needs to change, update this
> document **first**. New to specs? Read [README.md](README.md) first.

## 1. The problem

Budiman Company is building an HR Management System. Before anyone can use
it, the system has to know **who is using it** and **what they are allowed to
do**.

This first part of the system provides:

1. A **login** with each person's company email and password.
2. A **home page for each role**, so everyone lands in the right place.
3. **Protection**, so nobody can open another role's pages.

## 2. Who uses it (roles)

| Role | Home page | What they will do (built in Session 2) |
|------|-----------|-----------------------------------------|
| **Employee** | `/employee` | Apply for leave and track their requests. |
| **Supervisor** | `/supervisor` | Decide on requests sent to them. |
| **HR** | `/hr` | Decide on requests sent to HR. |
| **Admin** | `/admin` | See every leave record. |

Each user has exactly one role.

## 3. User stories

Format: *As a [role], I can [do something] so that [benefit].*

- **U1. Log in** *(Core)*. As any user, I can log in with my company email and
  password so that I see the screens for my role.
- **U2. Land on my home page** *(Core)*. As any user, after logging in I go
  straight to my role's home page, so I don't have to look for it.
- **U3. Stay logged in** *(Core)*. As any user, I stay logged in for up to 7
  days on the same browser, so I don't have to log in every time.
- **U4. Log out** *(Core)*. As any user, I can log out when I'm done, so the
  next person on this computer can't use my account.
- **U5. Only my own screens** *(Core)*. As any user, I can only open the pages
  for my own role, so nobody can act as someone else.

## 4. Acceptance checklist

The login is done when every box is ticked. Use the demo accounts (password
`password123`): `employee-1` and `employee-2` (Employees), `supervisor-1` and
`supervisor-2` (Supervisors), `hr-1` and `hr-2` (HR), `admin` (Admin). Each
logs in with that name followed by `@budiman.com`, e.g.
`employee-1@budiman.com`; the checks below use the short name.
Run `npm run db:seed` first to start from clean data.

| ✓ | ID | Check | How to test |
|---|----|-------|-------------|
| [ ] | AC-01 | A user can log in and lands on their role's home page. | Log in as `employee-1` → you are on `/employee`, a page with only a short hint line. Repeat for `supervisor-1` (`/supervisor`), `hr-1` (`/hr`), `admin` (`/admin`). |
| [ ] | AC-02 | A wrong password or an unknown email shows an error. | Log in as `employee-1` with password `wrong` → "Invalid email or password." Try `nobody@budiman.com` → the same message. |
| [ ] | AC-03 | Empty fields are not sent. | Click **Log in** with the boxes empty → the browser asks you to fill them in. |
| [ ] | AC-04 | A logged-out user is sent to the login page. | Log out, then type `/employee` in the address bar → you are on `/login`. |
| [ ] | AC-05 | A logged-in user who opens the login page goes to their home page. | Logged in as `hr-1`, type `/login` → you are on `/hr`. |
| [ ] | AC-06 | Logging out asks first, then returns to the login page. | Click **Log out** in the top bar → a confirmation box → confirm → you are on `/login`. |
| [ ] | AC-07 | A user cannot open another role's pages. | As `employee-1`, type `/hr` or `/admin` → you are sent back to `/employee`. As `admin`, type `/employee` → you are sent back to `/admin`. |
| [ ] | AC-08 | Every page shows who is logged in. | The top bar shows the user's name and role. On a phone, it shows the user's initials instead. |
| [ ] | AC-09 | An unknown page shows "Not found". | Type `/something-else` → "Not found", with a button back to your home page. |
## 5. Not included (for now)

These are **out of scope** for the login:

- Signing up, or resetting a forgotten password.
- Adding, editing or deleting user accounts (only the demo data creates users).
- The Leave Request module itself – that is what you build in Session 2.

---

# Leave Request – Requirements

> **What and why (this module).** This section adds the Leave Request module
> to the login above. It follows the workshop brief: replace Budiman's paper
> leave form with one request that is visible from submission to decision.
> The login parts above stay as they are. `U…` and `AC-…` numbers continue
> the login numbering.

## 6. The problem (this module)

Budiman still processes leave on paper: the employee fills a form, the
supervisor signs it, HR receives a copy and enters it into a spreadsheet.
Forms get lost, employees can't see where their request is, and HR has no
single list of what is waiting.

Goal: **one request, one system, visible from submission to decision.**
Every person sees exactly the requests they need to act on, and nothing
gets lost.

## 7. How a request moves

Each request has exactly **one status** at a time. The path is:

> Employee submits → *Waiting for Supervisor* → supervisor signs →
> *Ready to Send* (back with the employee) → employee sends to HR →
> *Waiting for HR* → HR approves → *Approved*.
>
> At either decision point the request can be **rejected with a remark** →
> *Rejected*. The employee can then **edit it and resubmit**, which puts it
> back at *Waiting for Supervisor*.

| Status | What it means | Who acts next |
|--------|---------------|---------------|
| *Waiting for Supervisor* | submitted, sitting with the chosen supervisor | That supervisor: sign, or reject with a remark |
| *Ready to Send* | supervisor signed; the ball is back with the employee | The employee: send to HR |
| *Waiting for HR* | in the shared HR queue; either HR officer may act | Either HR officer: approve, or reject with a remark |
| *Approved* | decided – leave granted | Nobody. It stays in history. |
| *Rejected* | turned down, with a remark from who rejected it | The employee: edit & resubmit, or leave it |

**Workflow rules (from the brief and the interview):**

1. Employees apply for leave; supervisors and HR only decide.
2. The employee chooses a supervisor **from their own division**.
3. Every request passes the supervisor first: signed, or rejected with a reason.
4. After it is signed, the employee sends it to the shared HR queue. Either
   HR officer may decide, and **the officer who decides is recorded**.
5. The admin sees every request and changes nothing.
6. Every action (submit, sign, reject, send, approve) **asks for confirmation
   first and shows a success message** after.
7. Rejection always needs a remark. A finished request (Approved or Rejected)
   stays in the history lists with its status and remarks — there is no
   archive to file it away.

## 8. User stories

Format: *As a [role], I can [do something] so that [benefit].*
All are **Core** (the brief's scope for this session); there are no Stretch
stories for this module.

- **U6. Apply for leave** *(Core)*. As an Employee, I can submit a leave
  request — leave type, start and end dates with the number of **working
  days** shown, a supervisor **from my own division**, and an **optional
  reason** — so that my leave goes into the system instead of onto paper.
- **U7. Track my requests** *(Core)*. As an Employee, I can see every
  request of mine with its status, days and remarks, and what I need to do
  next, so that I always know where my request is.
- **U8. Supervisor decides** *(Core)*. As a Supervisor, I can sign a request
  sent to me, or reject it with a remark, so that only checked leave moves on.
- **U9. Send to HR** *(Core)*. As an Employee, after my supervisor signs I
  can send the request to the shared HR queue, so that HR can decide.
- **U10. HR decides** *(Core)*. As an HR officer, I can approve or reject
  any request in the shared HR queue (a rejection needs a remark) so that HR
  has one list and nothing is lost; the system records **which officer**
  decided.
- **U11. Fix and try again** *(Core)*. As an Employee, I can edit a
  **rejected** request and resubmit it, so that I can correct it instead of
  starting a new one from scratch.
- **U12. Admin overview** *(Core)*. As an Admin, I can see every leave
  request in the system with its status and remarks, so that HR records are
  visible. I change nothing.

## 9. Acceptance checklist

Run `npm run db:seed` first to start from clean data. Use the demo accounts
from §4 (password `password123`). Home pages show a **"Needs your action"**
section on top and a **history** table below, newest first (columns are
designed in 02-design.md Part B).

Leave types: **Annual, Sick, Urgent, Unpaid**. Days are **working days**:
Saturday and Sunday are excluded; there is no public-holiday calendar.

| ✓ | ID | Check | How to test |
|---|----|-------|-------------|
| [ ] | AC-10 | An employee can submit a request. | Log in as `employee-1`. Open **New leave request**: type Annual, start `2026-12-07` (Mon), end `2026-12-11` (Fri) → the form shows **5 working days**; the supervisor list shows **only** `supervisor-1` (Finance & Administration), never `supervisor-2`; leave Reason empty. Click **Submit** → confirmation box → confirm → success message. The request appears in `employee-1`'s history as *Waiting for Supervisor*. |
| [ ] | AC-11 | Empty or missing fields are not sent. | In the form, clear the dates and click **Submit** → the browser asks to fill them. Pick a supervisor outside your division (not selectable, or rejected on save) → the request is not created. |
| [ ] | AC-12 | The end date must not be before the start date. | Start `2026-12-11`, end `2026-12-07` → an error message above the form; nothing is saved. |
| [ ] | AC-13 | Days are counted as working days. | Start `2026-12-12` (Fri), end `2026-12-14` (Mon) → the form shows **2 working days** (Sat and Sun excluded). |
| [ ] | AC-14 | A supervisor sees only requests sent to them. | `employee-2` (Software Development) submits a request choosing `supervisor-2`. Log in as `supervisor-1` → `employee-2`'s request is **not** in their list; `employee-1`'s request **is**, under *Needs your action*. Log in as `supervisor-2` → the reverse. |
| [ ] | AC-15 | A supervisor can sign a request. | As `supervisor-1`, click **Sign** on `employee-1`'s request → confirmation box → confirm → success message. The request moves to *Ready to Send* and appears under `employee-1`'s *Needs your action* ("send to HR"). It is **not** in the HR queue yet. |
| [ ] | AC-16 | A supervisor's rejection needs a remark. | As `supervisor-2` on `employee-2`'s request: click **Reject** with the remark empty → an error asks for a remark. Fill a remark → confirm → success. `employee-2` sees the request as *Rejected* with the remark, under *Needs your action* ("edit & resubmit"). |
| [ ] | AC-17 | The employee sends a signed request to HR. | As `employee-1`, click **Send to HR** → confirmation box → confirm → success message. The request is now *Waiting for HR*: it appears in **both** `hr-1`'s and `hr-2`'s *Needs your action* lists, and leaves `employee-1`'s action list. |
| [ ] | AC-18 | An HR rejection needs a remark. | As `hr-1`: **Reject** a waiting request with an empty remark → an error asks for a remark. Fill one → confirm → success. The request is *Rejected*, the remark is visible to the employee. |
| [ ] | AC-19 | HR approval is recorded with the deciding officer. | As `hr-2`, click **Approve** on `employee-1`'s request → confirmation → success. Status is *Approved* and the record shows **decided by HR 2**. It is visible in `employee-1`'s history and on `admin`'s list. |
| [ ] | AC-20 | The first HR officer to decide wins. | After `hr-2` decided AC-19's request, log in as `hr-1` → it is no longer in `hr-1`'s action list and no action buttons are offered for it. |
| [ ] | AC-21 | A rejected request can be edited and resubmitted. | As `employee-2`, open the *Rejected* request from AC-16, **Edit** the dates, **Submit** → confirmation → success. Status is *Waiting for Supervisor* again, and it reappears in `supervisor-2`'s *Needs your action*. |
| [ ] | AC-22 | The admin sees everything and changes nothing. | Log in as `admin` → every request appears with its status, days and remarks. There are **no** Sign / Reject / Send / Approve buttons anywhere on the admin pages. |
| [ ] | AC-23 | A user cannot do another role's action. | As `hr-1`, a request still *Waiting for Supervisor* is not in your action list and offers no buttons; as a Supervisor, no Approve (HR) option exists; employees see no decision buttons on their own requests. |

## 10. Not included (for now)

Out of scope for this module — noted so nobody assumes them:

- Editing or withdrawing a request **while it is still in flight** — it can
  only be changed after it is *Rejected*.
- Leave balances or quotas (no "days remaining" per employee).
- Email or in-app notifications — roles check their home pages.
- A public-holiday calendar — employees schedule around holidays themselves.
- Archiving or deleting finished requests — they stay in history (see § 7).
- Printing or exporting requests; creating new users.
