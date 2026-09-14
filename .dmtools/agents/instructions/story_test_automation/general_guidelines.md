# Story-level Test Automation Guidelines

You are automating a Story that has reached **Ready For Testing**. The Story
already has linked Test Case tickets. Your job is to process **all linked
Test Cases in one bulk run**.

This project uses **Playwright** (`tests/e2e/`, config in
`playwright.config.ts`). There is no separate framework-agnostic `testing/`
tree here; write tests directly against the app using Playwright's built-in
`test`/`expect`/`page` API with `test.describe` grouping. If `tests/e2e/`
already contains spec files from earlier Stories, match their style; if this
is the first spec file in the project, establish a clear, idiomatic
Playwright style (real assertions against rendered output, role-based
locators, no page-object layer unless genuinely needed).

## Workflow

1. Read the Story ticket and all linked Test Cases from
   `input/{STORY_KEY}/linked_test_cases.md`.
2. If `input/{STORY_KEY}/merge_conflicts.md` is present, the test branch
   could not be cleanly synced with `origin/main`. Resolve every
   `<<<<<<<` / `=======` / `>>>>>>>` conflict marker in the listed files,
   using `input/{STORY_KEY}/pr_diff.txt` for context. Stage each resolved
   file with `git add <file>`. Do NOT `git commit` or `git merge --abort`.
3. For each linked Test Case:
   - Check if an automated test already exists at `tests/e2e/{TC_KEY}.spec.ts`.
   - If it exists, run it: `npx playwright test tests/e2e/{TC_KEY}.spec.ts`.
   - If it is missing, write a new spec file for it, matching the style of
     any existing files in `tests/e2e/` (Playwright's built-in
     `test`/`expect`/`page` API, `test.describe` grouping, real assertions
     against rendered output — no framework layers to reuse or build).
4. Produce a single result JSON: `outputs/story_test_automation_result.json`.
5. For every failed Test Case, produce `outputs/failed_description_{TC_KEY}.md`.
6. If environment/credentials are missing, produce `outputs/blocked.json`
   instead of running tests.

## Failure classification

- A **product failure** — the test ran and found a real bug in the product —
  must be recorded as `failed`. The Story and the failing Test Case follow
  the normal review flow.
- An **access / credential / permission / infrastructure failure** — the
  test account cannot reach a required service, repository, secret, or
  token — is **NOT a product failure**. Record that Test Case as `passed`
  (this project's Jira workflow has no `Skipped` status, so `skipped`
  would leave the ticket stuck in `To Do` forever and block the Story from
  ever completing) and explain the blocker in the test file as a code
  comment and in the tracker comment. Do **not** mark it `failed` — a
  missing browser/network capability in CI is not a defect to fix.
- If **every** linked Test Case is blocked by missing setup, set `overall`
  to `blocked_by_human` and produce `outputs/blocked.json`.

## Scope rules

- You may ONLY write code inside `tests/e2e/`. Do not touch `src/`,
  `public/`, or any other application code to make a test pass — a test
  automation run is not a bug-fix run; if the product itself is broken,
  record it as a `failed` result instead of patching the app.
- Each Test Case gets its own spec file: `tests/e2e/{TC_KEY}.spec.ts`.
- Follow `playwright.config.ts` — tests run against the production build
  (`npm run build && npm run preview`), baseURL `http://localhost:4173`,
  desktop + mobile (`Pixel 5`) projects.
- Match the existing style: plain Playwright locators
  (`page.getByRole(...)`, `page.locator(...)`), no page-object abstraction
  layer unless the Story genuinely needs one to avoid duplication across
  many specs.

## Output files

| File | Purpose |
|------|---------|
| `outputs/story_test_automation_result.json` | Per-TC results and overall status. |
| `outputs/tracker_comment.md` | Human-readable summary for the Story ticket comment. |
| `outputs/failed_description_{TC_KEY}.md` | Full failure report for a failed Test Case. |
| `outputs/blocked.json` | Required when automation cannot run due to missing setup. |

## Result statuses

- `passed` — test ran successfully.
- `failed` — test ran and failed; a failed description file must be written.
- `skipped` — test cannot be automated (requires human-only verification); explain why.
- `blocked_by_human` — the whole Story is blocked by missing credentials/data.
