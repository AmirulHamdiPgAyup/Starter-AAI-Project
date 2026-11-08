# How to Read These Specifications

These three documents describe the **login** of the Budiman HRMS starter app.
They are a **worked example**: the login is already built, and these specs
describe exactly what exists. In Session 2 you write the same three files for
the **Leave Request module**, in the same style.

This way of working is called **Spec-Driven Development (SDD)**: we agree
*what* to build in writing first, then the AI agent builds from it, and we
check the result against it.

| File | Question it answers | Who owns it |
|------|---------------------|-------------|
| [01-requirements.md](01-requirements.md) | **What** should it do, and **why**? (user stories + acceptance checklist) | **You** – the AI interviews you, you correct it |
| [02-design.md](02-design.md) | **How** is it put together? Part A: the data. Part B: the app. | **Part A: you** review it. Part B: the AI drafts it |
| [03-tasks.md](03-tasks.md) | **In what order** do we build it, and how do we check each step? | The AI drafts it, you review it |

## The golden rule: fix the spec, not the code

If the app does something wrong, don't just tell the AI "fix it".

1. Find the line in the spec that is wrong or missing.
2. Update the spec, and review the change.
3. Ask the AI to build from the updated spec.
4. Check the result against the acceptance checklist.

This way the spec always describes the app that really exists.

## Adding the Leave Request module

In Session 2 you **add to** these files rather than starting new ones:

- **Requirements:** new user stories and acceptance checks for each role.
- **Design:** the leave request table and its statuses in Part A, new screens in Part B.
- **Tasks:** new tasks after the ones already here.

Keep the login parts as they are, unless you change how login works.

The checklists to run before every approval and build step are in
[checklists.md](checklists.md).

## Glossary

| Term | Plain meaning |
|------|---------------|
| **User story** | One sentence describing something a person needs: "As a *role*, I can *do something* so that *benefit*." |
| **Acceptance checklist** | A list of checks. When every box is ticked, the feature is done. Each check says how to test it. |
| **Database** | Where the app stores its data. We use **SQLite**, which is just one file on your computer (`prisma/dev.db`). |
| **Table / field** | A database table is like a spreadsheet; each field is a column. |
| **Prisma** | The tool the code uses to talk to the database. The tables are described in `prisma/schema.prisma`. |
| **Migration** | A saved step that creates or changes database tables. Kept in `prisma/migrations/`. |
| **Seed data** | Sample users put into the database so you can test straight away. |
| **Route** | The part of the web address after the site name, e.g. `/employee`. Each route is a screen. |
| **Server action** | A function that runs on the server when you press a button, e.g. "Log in". It checks who you are before changing anything. |
| **Session cookie** | A small, signed note the browser keeps after you log in, so the app remembers who you are. |
| **Password hash** | A scrambled form of the password. The real password is never stored. |
| **Role** | What kind of user you are: Employee, Supervisor, HR or Admin. It decides which screens you can see. |
| **404 / Not found** | The page the app shows when you open something that doesn't exist or that you are not allowed to see. |
