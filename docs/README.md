# IPSS Documentation

Documentation for **IPSS: Integrated POS and Stock Monitoring System for
Cafe Elvira** — a mobile-only Point-of-Sale + inventory app built with
React Native (Expo) + TypeScript + Supabase.

This folder is the single source of truth for how the app is specified, what
is implemented, what is planned, and how it works under the hood.

> Developers: `AGENTS.md` (repo root) covers setup, quality gates, and
> contribution rules. These docs describe the product and the system.

---

## Document map

| Document                               | Audience            | What it covers                                                                               |
| -------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| [`spec-overview.md`](spec-overview.md) | Stakeholders + devs | Product spec: roles, capabilities, shipped vs pending matrix, non-functional requirements    |
| [`features.md`](features.md)           | Developers          | Feature inventory: every feature → screens/hooks/api/db + build status, with code references |
| [`future-plans.md`](future-plans.md)   | Stakeholders + devs | Current gaps (promised but missing) and planned features with priority and effort            |
| [`architecture.md`](architecture.md)   | Developers          | 4-layer architecture, offline-first sync flow, navigation tree, state contexts               |
| [`database.md`](database.md)           | Developers          | Supabase schema, RPCs, RLS matrix, storage buckets, local SQLite mirror                      |
| [`api.md`](api.md)                     | Developers          | Client transport (`src/api/*`) and the `create-user` edge function                           |

---

## Suggested reading order

**Stakeholders / non-technical reviewers**

1. `spec-overview.md` — what the system does
2. `future-plans.md` — what is missing and what comes next

**Developers (onboarding)**

1. `AGENTS.md` (repo root) — setup, commands, quality gates
2. `features.md` — what exists and where it lives in code
3. `architecture.md` — how the layers fit together
4. `database.md` + `api.md` — the data and transport contracts

---

## How these docs stay accurate

- All status values are checked against the codebase at the time of writing.
  A feature marked `implemented` has working code paths; `stubbed` means the
  UI is visible but inert; `planned` means it does not exist yet.
- `database.md` and `api.md` are hand-written from `supabase/migrations/` and
  `src/api/`. If the schema or transport changes, update these files in the
  same commit.
- `future-plans.md` is a living document: move items into `spec-overview.md`
  when they ship.

## Maintenance

| When                         | Action                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| New feature ships            | Move it from `future-plans.md` into `spec-overview.md`/`features.md` as `implemented` |
| Schema / RPC / API changes   | Update `database.md` + `api.md` in the same commit                                    |
| New "coming soon" UI appears | Add it to `future-plans.md` gap list                                                  |
