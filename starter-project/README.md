# HRMS · Starter App

The app built in the **Vibe Coding 101 with Agentic AI** workshop: Budiman
Company's HR Management System. **Login works for all four roles**, and the
**Leave Request module** (built in Session 2, the Spec-Driven Development
way) takes each request from submission to decision.

## How a leave request moves

Employee submits → **Waiting for Supervisor** → supervisor signs →
**Ready to Send** → employee sends to HR → **Waiting for HR** → HR approves →
**Approved**. At either decision point the request can be **rejected with a
remark**; the employee can then **edit it and resubmit**, which puts it back
at *Waiting for Supervisor*. Every action asks for confirmation first and
shows a success message after. Leave types: Annual, Sick, Urgent, Unpaid;
days are counted as **working days** (Saturday and Sunday excluded).

## Screens

| Screen | Route | Role |
|--------|-------|------|
| Log in | `/login` | everyone |
| My leave requests — *Needs your action* + *History*, plus **New leave request** | `/employee` | Employee |
| Request view (and **Edit & resubmit** when *Rejected*) | `/employee/requests/[id]` | Employee |
| Supervisor queue — **Sign** / **Reject** (remark required) + history | `/supervisor` | Supervisor |
| HR shared queue — **Approve** / **Reject** (remark required) + history with *Decided by* | `/hr` | HR |
| Read-only overview of every request | `/admin` | Admin |

Each role's home page shows a **Needs your action** section on top and a
**history** table below, newest first. Server pages and actions re-check the
user's role, ownership and the request's status on every request — the
buttons a screen shows are never the only gate.

## What's already here

- **Login and logout** with a company email and password, and a signed
  session cookie.
- **Four roles** – Employee, Supervisor, HR and Admin – each with its own home
  page. Nobody can open another role's pages.
- **The Leave Request module**: apply, track, supervisor signing, the shared
  HR queue, edit & resubmit, and the admin overview.
- **The app frame**: a top bar with the app name, who is logged in and **Log out**, in the Budiman HRMS style.
- **Building blocks** in `src/components/ui/` (Button, Card, PageHeader,
  dialogs, form fields…) and leave components in `src/components/leave/`.
- **The specs** in `docs/specs/` – the login example plus the Leave Request
  requirements, design and task files this app was built from.

## The project

The scenario, workflow and scope are in the **Workshop Project Brief**, which
you get from the facilitator. In Session 2 the AI agent interviews you about
it before writing anything.

## Tech stack

- **Next.js** (App Router) + TypeScript
- **Prisma 6** + **SQLite** (a local file database, no server needed)
- **Tailwind CSS**
- **bcryptjs** for password hashing
- Signed, `httpOnly` session cookie for login

## Getting started

You need **Node.js 20.9 or newer** (check with `node --version`) and Git.

```bash
npm install            # 1. install dependencies (needs internet)
cp .env.example .env   # 2. create your settings file (Windows: copy .env.example .env)
npm run db:migrate     # 3. create the SQLite database from prisma/migrations
npm run db:seed        # 4. add the demo users and sample leave requests
npm run dev            # 5. start the app at http://localhost:3000
```

To reset the demo users at any time, run `npm run db:seed` again.

**If something goes wrong**

| Problem | Fix |
|---------|-----|
| `Environment variable not found: DATABASE_URL` | You skipped step 2. Create the `.env` file. |
| `npm install` fails while downloading Prisma engines | Your network blocks `binaries.prisma.sh`. Try another network, or ask the facilitator. |
| `Port 3000 is in use` | Another app is running. Stop it, or run `npm run dev -- -p 3001`. |
| Login says "Invalid email or password" | Run `npm run db:seed` to recreate the demo users. |

## Demo accounts

All demo users share the password `password123`.

| Email                      | Role | Home page |
| -------------------------- | ---- | --------- |
| `employee-1@budiman.com`   | Employee | `/employee` |
| `employee-2@budiman.com`   | Employee | `/employee` |
| `supervisor-1@budiman.com` | Supervisor | `/supervisor` |
| `supervisor-2@budiman.com` | Supervisor | `/supervisor` |
| `hr-1@budiman.com`         | HR | `/hr` |
| `hr-2@budiman.com`         | HR | `/hr` |
| `admin@budiman.com`        | Admin | `/admin` |

## Sample leave requests

`npm run db:seed` also creates six made-up requests so every screen has
something to show:

| Employee | Type | Dates (2026) | Status |
|----------|------|--------------|--------|
| employee-1 | Annual | 16–20 Nov | *Waiting for Supervisor* |
| employee-1 | Unpaid | 23–25 Nov | *Ready to Send* |
| employee-1 | Urgent | 30 Nov – 1 Dec | *Waiting for HR* |
| employee-1 | Annual | 7–11 Dec | *Approved* (by HR 1) |
| employee-2 | Sick | 17–18 Nov | *Waiting for Supervisor* |
| employee-2 | Urgent | 25–27 Nov | *Rejected* (with a supervisor remark — try Edit & resubmit) |

## Scripts

| Command            | What it does |
|--------------------|--------------|
| `npm run dev`      | Start the dev server. |
| `npm run build`    | Production build. |
| `npm run start`    | Serve the production build. |
| `npm run lint`     | Run ESLint. |
| `npm run db:migrate` | Apply Prisma migrations. |
| `npm run db:seed`  | Reseed the demo users. |
| `npm run db:studio` | Open Prisma Studio to inspect the data. |

## Specifications

The specs live in `docs/specs/`. Start with `docs/specs/README.md` – it
explains how to read them and has a glossary of terms.

- `01-requirements.md` — user stories and the acceptance checklist (the *what* and *why*).
- `02-design.md` — Part A: data design (the `User` table, rules). Part B: app design (screens, code layout).
- `03-tasks.md` — the ordered build tasks and which checks prove each one is done.

`docs/specs/checklists.md` has a checklist to run before each approval and
build step.

In Session 2 you add the Leave Request module to these same three files. The
rule of the workshop: when something changes, **fix the spec first**, then
build it.

## Working with the AI agent

`AGENTS.md` tells the AI agent how to work with you in Session 2: it
**interviews you first**, writes the specs with you one at a time (waiting for
your approval after each), then builds task by task and asks you to check
each one in the browser.

To begin, start a new chat in the Illham Harness and type the line below. You
can also attach the Workshop Project Brief to give the agent the details.

> Read AGENTS.md, then start the interview.
