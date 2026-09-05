# Technical Requirements Document (TRD)
## Batch-Level Traceability & Alert System for Drug Adverse Reactions

**Working title:** ADRConnect
**Status:** Draft v2 — for review
**Companion doc:** PRD.md (functional requirements, form structure)

---

## 1. Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   Android App          │  HTTPS  │   Backend API           │         │   PostgreSQL DB    │
│   (Nurse, ADR Head,     │ ◄─────► │   (REST, stateless)     │ ◄─────► │   (Cloud-hosted)    │
│   Administrator)        │         │                          │         │                    │
│                         │         │  - Auth (JWT, 3 roles)  │         │  - ADR records      │
│  - Local DB (offline)   │         │  - ADR CRUD             │         │  - Drug/manufacturer/│
│  - Sync queue           │         │  - Cross-check logic    │         │    batch master     │
│  - Barcode scanner      │         │  - High-alert flagging  │         │  - Users            │
│                         │         │  - Analytics/graphs     │         │  - Notifications log │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
```

Single app, three roles (`nurse`, `adr_head`, `administrator`) determined at login — the UI shows different screens per role, but it's one Flutter codebase, not three separate apps. Single hospital, single backend instance for the pilot. No multi-tenant complexity — but schema includes a `hospital_id` field on core tables from day one (cheap to add now, expensive to retrofit later) so Phase 2 (state-level, multi-hospital) doesn't require a schema rewrite.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Mobile app | **Flutter** (Dart) | Single codebase, strong offline-storage packages, mature barcode-scanning plugins, faster to build solo/small-team than native Kotlin for a pilot timeline |
| Local/offline storage | **Drift** (SQLite wrapper for Flutter) | Structured local DB matching the server schema closely; reliable offline queue, easy conflict handling. Primarily used by the nurse role — ADR Head/Administrator screens are more dashboard-oriented and can assume better connectivity, but still benefit from basic local caching |
| Charting (ADR Head dashboard) | **fl_chart** (Flutter plugin) | Bar/line/pie charts for reactions-by-drug, trend-over-time, and outcome distribution, rendered natively in the same app |
| Barcode/QR scanning | **mobile_scanner** (Flutter plugin) | Reads barcodes already printed on IV bottle labels (still pending your compatibility check across manufacturers) |
| Backend | **Node.js + Express** (or FastAPI/Python — either works; pick based on who's building it) | Simple REST API, easy to host cheaply |
| Database | **PostgreSQL** | Relational integrity for drug/manufacturer/batch/ADR relationships; good free-tier cloud options |
| Hosting | **Cloud** — Render, Railway, or AWS free tier to start | Matches your preference; low upfront cost |
| Auth | **JWT-based**, role field (`nurse` / `adr_head` / `administrator`) | Simple, standard, no need for complex identity provider at pilot scale |

## 3. Offline-First Sync Design

This is the most important technical piece for the **nurse** role specifically, since ward connectivity is unreliable. ADR Head and Administrator screens (dashboard, analytics, drug lookup) are used in less time-critical settings and can reasonably assume network access, though basic local caching still applies.

**Principle:** the nurse never waits on the network. Every action (save draft, partial submit, complete submit) writes to the local Drift DB first and is immediately usable. Sync is a background concern.

**Flow:**
1. Nurse fills/saves/submits an ADR → written to local DB with a `sync_status` field (`pending`, `synced`, `failed`) and a `submission_state` field (`draft`, `partial`, `complete` — per PRD Section 6.1a).
2. A background sync worker checks connectivity periodically (and on app foreground) and pushes any `pending` records to the backend.
3. On successful push, backend returns a server-assigned ID; local record updates to `synced` and stores that ID.
4. If push fails (network drop mid-sync), record stays `pending` and retries with backoff — no data loss.
5. The nurse's home screen shows a simple counter: *"2 reports pending sync"* — visibility without blocking her workflow.
6. **Drug/manufacturer/batch master list** is downloaded and cached locally on login/whenever synced, so the searchable dropdown works fully offline too.
7. **Cross-check ("has this batch reacted before?")** runs against the locally cached ADR history first (best-effort offline), then re-confirms against the server on sync.
8. **Follow-up entries:** when a nurse chooses "Follow-up" from Home, the app looks up the existing Partial Submit case (locally cached if available, else fetched from server) and attaches the new information to it rather than creating a new record.

**Conflict handling:** unchanged from v1 — last-write-wins on optional fields, required fields already synced are never overwritten.

## 4. API Design (Core Endpoints)

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | POST | Nurse/ADR Head/Administrator login, returns JWT with role claim |
| `/adr` | POST | Submit new ADR (Partial or Complete state) or batch-submit queued offline records |
| `/adr` | GET | List/search/filter ADRs (ADR Head dashboard) — query params: `manufacturer`, `batch_no`, `ward`, `date_range`, `severity`, `submission_state` |
| `/adr/:id` | GET | Full ADR detail, including linked history of same batch/manufacturer |
| `/adr/:id` | PATCH | ADR Head edits (Causality Assessment, Action Taken, Outcome) or nurse follow-up completing a Partial Submit into Complete |
| `/adr/:id/mark-pvpi-sent` | POST | ADR Head marks a report as sent to Pharmacovigilance (in-app status only) |
| `/adr/check-history` | POST | Cross-check: given manufacturer + batch, return prior ADR count/summary |
| `/adr/analytics` | GET | Aggregated data for ADR Head dashboard graphs — counts by drug/manufacturer, trend over time buckets, outcome distribution |
| `/drug-products` | GET / POST | Fetch/add master drug list entries (Administrator) |
| `/manufacturers` | GET / POST | Fetch master list / Administrator adds new manufacturer |
| `/batches` | GET / POST | Fetch/add batch entries, linked to manufacturer + drug product |
| `/batches/:id/flag` | POST | ADR Head marks batch/manufacturer as High Alert ("danger"), with reason |
| `/batches/:id/caution-status` | GET | **Administrator's dispensing lookup** — live check only, returns current caution/high-alert status for a drug/batch; no request body is logged |
| `/notifications/caution` | POST | ADR Head notifies Administrator that a specific drug needs cautious use |
| `/sync/pull` | GET | Pulls latest drug/manufacturer/batch list + any flags, for local cache refresh |

## 5. Security & Data Handling

- **Patient data is minimal by design** — the PvPI form only captures Patient Initials, age, sex, weight (no name, no ID number). Still treated as sensitive health data.
- JWT auth with short-lived tokens + refresh; role-based access — nurse cannot see ADR Head's review actions or edit Causality Assessment; Administrator cannot edit ADR clinical content, only drug master data.
- All API traffic over HTTPS.
- Data at rest encrypted (standard managed Postgres encryption on any major cloud host).
- Immutable ADR records once submitted — edits by ADR Head are stored as an amendment/audit log entry, not an overwrite.
- The Administrator's dispensing-status check (`/batches/:id/caution-status`) is confirmed as a **live lookup with no persistent log** — per your decision, this endpoint does not write any record of the check or its outcome.
- No data broader than what the PvPI form itself already asks for.

## 6. Non-Functional Notes

- **Performance target:** nurse form save/submit is a local DB write — should feel instant (<200ms) regardless of network. Administrator's caution-status lookup should also feel instant, since it happens live at the moment of physically handing over a drug.
- **Battery/storage:** local DB stays small; barcode scans don't store images, just the decoded string.
- **Resilience:** app must not crash or lose data on network loss mid-submission.

## 7. Open Questions / Assumptions for This Doc

1. **Backend language (Node vs Python/FastAPI):** functionally equivalent for this scope — pick based on who's actually building it.
2. **Drug/manufacturer/batch master list seeding** (PRD Section 8) is still open — determines whether these endpoints need a bulk-import route (CSV upload) or just manual Administrator entry.
3. **Hosting provider specifics** (Render vs Railway vs AWS) — any of these work; finalize once budget/timeline is known.
4. **Analytics endpoint scope** — `/adr/analytics` is scoped for three chart types per PRD FR21 (by drug/manufacturer, trend over time, outcome distribution); confirm if additional breakdowns are wanted before backend work starts.

## 8. Next Steps

Once this is confirmed, next document is **UI/UX Design** (screens, flows for nurse form-fill, ADR Head dashboard with graphs, and Administrator's master-list + dispensing-lookup screens) — followed by **App Flow**, then **Backend Schema**, then the **Implementation Plan**.
