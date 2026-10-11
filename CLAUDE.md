# Weekly Recipe Planner

A web app that learns my taste, recommends 3 recipes a week (mix of past favorites and new-but-achievable), and builds one grocery checklist I can use on my phone at the store. I'm the main user; friends and family may try it later.

Success test: used in 3 of the first 4 weeks, and at least 4 new recipes cooked in that month.

## Stack (decided)

- Next.js (App Router) + React + TypeScript (strict mode)
- Postgres on Neon, accessed through Prisma
- Hosting: Vercel (Hobby plan, personal use)
- Later, only when a milestone needs it: background worker for recipe extraction (Milestone 2), Zod validation at the scraping boundary, Docker/container host for the worker, caching, an embedding service

Check current official docs for setup commands and config. Prisma and Next.js have changed their setup recently, so do not rely on memory for install steps.

## How to work with me (important)

I'm using this project to learn, with a career goal of strong full-stack/backend skills. Default to teaching mode:

- Explain the concept before writing code, and ask before generating whole files.
- Scaffolding, config, boilerplate UI and styling: you can just do these, then tell me what you did and why.
- Core pieces I want to write myself: the data model, pick selection and tag rules, and the first version of each new infrastructure layer (worker, caching, CI/CD). For these, give hints, review what I wrote, and explain errors. Do not hand me finished code unless I ask.
- Keep changes small. Commit often with clear messages, and show me diffs I can actually read.
- If I'm about to make a design mistake, say so plainly, with the reason.

## Architecture rules

- Keep real logic (pick selection, tag rules, ingredient merging) in plain TypeScript modules under `src/lib/`, separate from page and route code. Pages and server actions stay thin.
- Put Prisma queries in small named functions (for example `getRecipesForUser(userId)`), not scattered through components.
- Everything belongs to a user from the start (`userId`), even though there is one user in Milestone 1. Milestone 1 can skip login: seed me as the single user.
- Never commit secrets. `.env` stays out of git; provide `.env.example`.

## Data model decisions

The schema I wrote is in `docs/schema-draft.prisma` (models only; the datasource and generator blocks come from the Prisma setup in the current docs). Key choices:

- Recipes are per-user copies (`userId` on Recipe), not a shared catalog. Chosen for simplicity. Keep `source` and `sourceUrl` populated so recipes could be merged later.
- Tags: categories are a fixed enum (cuisine, protein, method, effort, stretch, reheats). Values are rows, unique per category and name.
- `ChecklistItem` is one line on the grocery list: one ingredient, from one recipe, in one weekly plan. It copies quantity and unit as a snapshot.
- Normalize `WeeklyPlan.weekStart` (always the Monday at midnight) so the unique constraint works.

## Milestone 1 (current)

Goal: about 10 hand-entered recipes, 3 picks, and a grocery checklist that works on my phone, with checks that survive a reload. Gate: I plan one real week and shop from it.

Steps:
1. Create the Next.js app (TypeScript, App Router), push to GitHub, deploy to Vercel. Verify the starter page loads on my phone.
2. Create the Neon database and connect Prisma. Store the connection string in Vercel env vars and local `.env`.
3. Take `docs/schema-draft.prisma` into the project, run `prisma validate`, then the first migration.
4. Seed script: one user plus about 10 recipes with ingredients and tags.
5. Picks page: show 3 recipes (random is fine for now).
6. Grocery checklist: combine the picks' ingredients grouped by recipe, with check-offs saved to the database.

Out of scope for now: scraping, taste learning, refresh and swap, ratings, auth, nutrition sync, an in-app cooking view. Each recipe links out to the original page.
