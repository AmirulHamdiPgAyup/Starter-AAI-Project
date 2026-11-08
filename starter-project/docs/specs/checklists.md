# Spec Checklists

Tick a checklist **before** moving to the next step. Each checklist is the
gate between two steps of the process: interview → requirements → design →
tasks → build. Run it, show it to the participant, and get their approval.

- [A. Before writing the specs (end of interview)](#a-before-writing-the-specs-end-of-interview)
- [B. Requirements review](#b-requirements-review)
- [C. Design – Part A review (data — you own this)](#c-design--part-a-review-data--you-own-this)
- [D. Design – Part B review (app)](#d-design--part-b-review-app)
- [E. Tasks review](#e-tasks-review)
- [F. Before each build step](#f-before-each-build-step)
- [G. After each build step](#g-after-each-build-step)
- [H. Definition of done (whole module)](#h-definition-of-done-whole-module)

## A. Before writing the specs (end of interview)

- [ ] The **problem** is clear: what is hard today, and for whom.
- [ ] Every **role** that touches the module is named, with what they do.
- [ ] The **rules** are decided (valid values, who may do what, what happens
      on errors) — no open questions left.
- [ ] **Scope** is agreed: what is in, what is out (goes into requirements §5).
- [ ] Anything decided as "later" is marked **Stretch**, not quietly assumed.
- [ ] The summary was read back to the participant and **confirmed**.

## B. Requirements review

Against the login example in [01-requirements.md](01-requirements.md):

- [ ] Every story follows *As a [role], I can … so that …* and is marked
      **Core** or **Stretch**.
- [ ] `U…` and `AC-…` numbers **continue** the existing numbering.
- [ ] Every acceptance check says **how to test it** in concrete steps
      (account, click, expected result).
- [ ] The checks cover each role, plus failures: wrong input, empty fields,
      doing something not allowed.
- [ ] Out-of-scope items are listed in §5.
- [ ] Only **made-up data** appears — no real names, emails, documents or keys.

## C. Design – Part A review (data — you own this)

- [ ] Every new table explains **what one row is**, and every field says its
      type, whether it is required, and what it holds.
- [ ] Only needed fields — nothing stored "in case".
- [ ] The rules cover valid values, uniqueness, allowed state changes, and
      what each role may change.
- [ ] Allowed-value lists go to `src/lib/constants.ts` (SQLite has no enums).
- [ ] The participant has read and **approved the rules in their own words**.

## D. Design – Part B review (app)

- [ ] Every user story lands on a **screen** in the routes table.
- [ ] Every route says **who** may open it, and what happens for everyone else.
- [ ] Empty, error and success states are described, reusing
      `src/components/ui/` building blocks.
- [ ] Security is real: pages use `requireRole`, and **server actions
      re-check** — hiding a button is not enough.
- [ ] The code layout reuses existing files and components before adding new ones.
- [ ] Demo data covers every role and every state the checks need.

## E. Tasks review

- [ ] Tasks are small: one thing, checkable in a few minutes, app still works
      after each.
- [ ] Ordered by dependency: data → screens → polish; **Core first**.
- [ ] Every task lists its **files** and the **AC ids** it proves.
- [ ] Every Core AC is covered by at least one task; no task builds what the
      specs don't say.
- [ ] The last task is the final check: full checklist as each role + `npm run
      lint` + `npm run build`.

## F. Before each build step

- [ ] The specs are **approved** — no app code before this.
- [ ] Exactly one task is being built, the next undone one in the list.
- [ ] The reviewer knows which AC checks prove the task.

## G. After each build step

- [ ] `npm run lint` passes.
- [ ] The task's AC checks pass when the reviewer agent tries them.
- [ ] The participant got **exact browser steps** and confirmed it themselves.
- [ ] If a check failed: the **spec line was fixed first**, the fix approved,
      then rebuilt — not patched silently in code.

## H. Definition of done (whole module)

- [ ] Every **Core** acceptance check is ticked, tested as each role,
      starting from `npm run db:seed`.
- [ ] Stretch checks ticked only if the participant asked for them.
- [ ] `npm run lint` and `npm run build` pass.
- [ ] Login and its checks still work (existing features not broken).
- [ ] The specs match the app as it really behaves; the README explains any
      new commands or demo data.

## When something is wrong: fix the spec, not the code

1. Find the line in the spec that is wrong or missing.
2. Update the spec, and review the change.
3. Ask the AI to build from the updated spec.
4. Check the result against the acceptance checklist.
