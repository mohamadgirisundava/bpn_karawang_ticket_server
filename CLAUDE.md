# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A vanilla [PocketBase](https://pocketbase.io) backend for a queue/ticketing system ("BPN Karawang" — antrian tiket loket). There is no custom Go code and no `pb_hooks` — the entire backend is the stock PocketBase server plus a schema defined via migrations. All business logic (calling numbers, assigning counters, etc.) is expected to live in a separate frontend client that talks to PocketBase's REST/realtime API.

Full collection/field/API-rule documentation is in `COLLECTIONS.md` — read that before making schema changes so new migrations stay consistent with existing rules and relations.

## Commands

Run the server locally:
```bash
pocketbase serve
```
- Admin dashboard: `http://127.0.0.1:8090/_/`
- API base: `http://127.0.0.1:8090/api/`
- Health check: `http://127.0.0.1:8090/api/health`

`pocketbase.exe` in the repo root is a Windows binary from the original dev machine — it will not run on macOS/Linux. On those platforms use a native `pocketbase` binary (e.g. installed via Homebrew) run from this directory; it will pick up `pb_data/` and `pb_migrations/` the same way. There is no build/lint/test tooling in this repo since there's no application code — just data and migrations.

## Schema changes

Collection schema lives in `pb_migrations/*.js`, applied automatically on server start. Files are timestamp-ordered (`<unix_ts>_<created|updated>_<collection>.js`) and each exports an up/down pair via `migrate((app) => {...}, (app) => {...})`.

- Prefer editing schema through the Admin UI (`/_/`) — PocketBase auto-generates the matching migration file in `pb_migrations/` on save.
- After changing schema, update `COLLECTIONS.md` to match (it's a hand-maintained snapshot, not auto-generated).
- Collection/field internal `id`s (e.g. `pbc_90131592`, `text1997877400`) are referenced by relation fields across collections — don't hand-edit them.

## Data persistence

Unusually for a PocketBase project, `pb_data/data.db` and `pb_data/auxiliary.db` (the actual SQLite data) **are committed to git** and act as the shared dev dataset. `*.db-shm`, `*.db-wal`, and `*.db-journal` are gitignored (transient SQLite WAL journal files, safe to regenerate).

Because of this, **stop the server (`Ctrl+C`) before committing** — PocketBase checkpoints the WAL into `data.db` on clean shutdown, so the committed `data.db` stays self-contained. Committing while the server is running risks leaving recent writes stranded in the ignored WAL file.

## Collections at a glance

`counters` (loket master) → `queues` (tickets, status: waiting/called/serving/completed/skipped) → `calls` (call-out log). `settings` is a key/value config table. `users` is the auth collection for petugas/admin accounts with `role: admin|officer`. See `COLLECTIONS.md` for full field lists and API rules per collection.
