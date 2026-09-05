# Backend Schema
## Batch-Level Traceability & Alert System for Drug Adverse Reactions

**Working title:** ADRConnect
**Status:** Draft v2 — for review
**Companion docs:** PRD.md, TRD.md, UI_UX_Design.md, App_Flow.md
**Database:** PostgreSQL (per TRD)

---

## 1. Entity Relationship Overview

```
hospitals ──┬──< users (role: nurse | adr_head | administrator)
             │
             ├──< adr_reports >──< adr_medications >── batches ──> manufacturers
             │         │                                   │
             │         └──< adr_amendments                 └──> drug_products
             │
             ├──< high_alerts (references batches / manufacturers)
             │
             └──< caution_notifications (ADR Head → Administrator)
```

- `drug_products` is the master list of medication names — decoupled from manufacturer, since the same product is made by multiple manufacturers.
- `batches` is the traceable unit: one row per (product + manufacturer + batch number) combination.
- `caution_notifications` is new in v2 — captures the ADR Head → Administrator messaging flow (this **is** persisted, unlike the Administrator's live dispensing-status check, which per your decision keeps no record).
- `hospital_id` on `users` and `adr_reports` remains from v1, for future multi-hospital scaling.

## 2. Tables

### 2.1 `hospitals`
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| name | text | |
| state | text | |
| created_at | timestamp | |

### 2.2 `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| hospital_id | UUID, FK → hospitals | |
| name | text | |
| role | enum(`nurse`, `adr_head`, `administrator`) | three roles only — no doctor role |
| employee_id | text, unique | login identifier |
| password_hash | text | |
| ward | text, nullable | relevant for nurse filtering |
| occupation | text | auto-fills Reporter field on ADR form |
| created_at | timestamp | |

### 2.3 `drug_products`
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| name | text | e.g. "Dextrose 5D", "Normal Saline", "Avil" |
| generic_name | text, nullable | |
| form | text, nullable | e.g. "500ml IV infusion", "2ml injection" |
| created_at | timestamp | |

### 2.4 `manufacturers`
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| name | text | |
| address | text, nullable | |
| license_no | text, nullable | |
| created_at | timestamp | |

### 2.5 `batches` — the core traceability table
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| product_id | UUID, FK → drug_products | |
| manufacturer_id | UUID, FK → manufacturers | |
| batch_no | text | |
| mfg_date | date | |
| exp_date | date | |
| barcode_data | text, nullable | |
| added_by | UUID, FK → users, nullable | Administrator, typically |
| created_at | timestamp | |
| **Unique constraint** | (product_id, manufacturer_id, batch_no) | |

**Index:** `batch_no`, `manufacturer_id`.

### 2.6 `adr_reports` — one per incident
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| local_uuid | UUID | client-generated, dedupe on sync retry |
| hospital_id | UUID, FK → hospitals | |
| reporter_user_id | UUID, FK → users | the nurse |
| case_type | enum(`initial`, `follow_up`) | |
| **submission_state** | enum(`draft`, `partial`, `complete`) | **new in v2** — replaces the simpler draft/submitted status; drives the Follow-up flow (App_Flow.md Section 1) |
| **pvpi_sent** | boolean, default false | **new in v2** — set true via ADR Head's "Mark Sent to Pharmacovigilance" action |
| **pvpi_sent_at** | timestamp, nullable | **new in v2** | |
| patient_initials | text | |
| patient_age | text | free text, matches real form usage (e.g. "38wks", "36yrs") |
| patient_sex | enum(`M`, `F`, `Other`) | |
| patient_weight_kg | numeric, nullable | |
| reaction_start_date | date | |
| reaction_recovery_date | date, nullable | typically filled on Follow-up, completing the case |
| reaction_description | text | free text, populated with help of smart symptom suggestions client-side |
| other_history | text, nullable | |
| seriousness_flags | jsonb, nullable | |
| outcome | enum(`fatal`,`continuing`,`recovering`,`recovered`,`unknown`), nullable | |
| sync_status | enum(`pending`,`synced`,`failed`) | |
| ward | text | |
| report_date | date | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Index:** `reaction_start_date`, `reporter_user_id`, `submission_state`.

### 2.7 `adr_medications` — repeatable rows per report
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| adr_report_id | UUID, FK → adr_reports | |
| batch_id | UUID, FK → batches | this join powers cross-checking |
| row_order | int | |
| dose_used | text, nullable | |
| route_used | text, nullable | |
| frequency | text, nullable | |
| therapy_start_date | date, nullable | |
| therapy_stop_date | date, nullable | |
| indication | text, nullable | |
| action_taken | enum(`withdrawn`,`dose_increased`,`dose_reduced`,`not_changed`,`not_applicable`,`unknown`), nullable | |
| reintroduction_reaction | enum(`yes`,`no`,`unknown`,`na`), nullable | |
| causality_assessment | text, nullable | filled by ADR Head only |

**Index:** `batch_id`.

### 2.8 `high_alerts`
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| batch_id | UUID, FK → batches, nullable | |
| manufacturer_id | UUID, FK → manufacturers, nullable | at least one of these two required |
| reason | text | |
| flagged_by | UUID, FK → users | ADR Head |
| flagged_at | timestamp | |
| active | boolean | default true |
| resolved_at | timestamp, nullable | |
| resolved_by | UUID, FK → users, nullable | |

**Index:** `batch_id` where `active = true`, `manufacturer_id` where `active = true` — read by both the nurse's Step 3 warning banner and the Administrator's Dispensing Lookup (`/batches/:id/caution-status`).

### 2.9 `caution_notifications` — **new in v2**
Captures the ADR Head → Administrator messaging flow described in the PRD. This *is* a persisted record (distinct from the Administrator's live dispensing check, which is intentionally not logged).

| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| batch_id | UUID, FK → batches, nullable | |
| manufacturer_id | UUID, FK → manufacturers, nullable | at least one required |
| message | text | e.g. "Use cautiously — 2 prior reactions" |
| sent_by | UUID, FK → users | ADR Head |
| sent_at | timestamp | |
| acknowledged | boolean, default false | set true once Administrator opens/actions it |
| acknowledged_by | UUID, FK → users, nullable | |
| acknowledged_at | timestamp, nullable | |

**Index:** `acknowledged` where `false` — powers the Administrator's notification inbox badge count.

### 2.10 `adr_amendments` — audit trail for ADR Head edits
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| adr_report_id | UUID, FK → adr_reports | |
| adr_medication_id | UUID, FK → adr_medications, nullable | |
| field_name | text | |
| old_value | text, nullable | |
| new_value | text | |
| edited_by | UUID, FK → users | |
| edited_at | timestamp | |

## 3. Query Patterns This Schema Is Optimized For

| Feature | Query |
|---|---|
| "Has this batch reacted before?" (nurse Step 3) | `SELECT count(*) FROM adr_medications WHERE batch_id = ?` |
| Batch history (ADR Head detail view) | Join `adr_reports` → `adr_medications` on `batch_id`, order by `reaction_start_date DESC` |
| High-alert / caution banner (nurse selection, Administrator lookup) | `SELECT * FROM high_alerts WHERE (batch_id = ? OR manufacturer_id = ?) AND active = true` |
| **Administrator Dispensing Lookup** | Same `high_alerts` query as above — live read, no write, no log table involved |
| ADR Head dashboard graphs (reactions by drug) | `SELECT drug_products.name, count(*) FROM adr_medications JOIN batches ... JOIN drug_products ... GROUP BY drug_products.name` |
| ADR Head dashboard graphs (trend over time) | `SELECT date_trunc('week', reaction_start_date), count(*) FROM adr_reports GROUP BY 1 ORDER BY 1` |
| ADR Head dashboard graphs (outcome distribution) | `SELECT outcome, count(*) FROM adr_reports GROUP BY outcome` |
| Administrator's notification inbox | `SELECT * FROM caution_notifications WHERE acknowledged = false ORDER BY sent_at DESC` |
| Follow-up entry lookup | `SELECT * FROM adr_reports WHERE id = ? AND submission_state = 'partial'` |

## 4. Client-Side (Local) Schema Note

The Flutter app's local Drift DB mirrors `adr_reports`, `adr_medications`, `batches`, `manufacturers`, and `high_alerts` (read-mostly cache for the latter three). Local records use `local_uuid` as their primary reference until synced. The Administrator's Dispensing Lookup screen reads from the same locally-cached `high_alerts` data when offline, clearly labeled with a last-synced timestamp (per App_Flow.md Section 5).

## 5. Open Questions

1. **`patient_age` as free text** — kept from v1, still open for confirmation.
2. **High-alert scope** (batch-level vs. manufacturer-wide) — still open from v1.
3. **`caution_notifications` acknowledgment** — currently just a boolean + timestamp; confirm this is sufficient, or if the Administrator should be able to reply/close with a note (would add a `response_note` column — low cost either way).

## 6. Next Steps

Once confirmed, next document is the **Implementation Plan** (build sequence, milestones, pilot rollout steps).

---
**Revision note (v2):** Renamed `admin` role to `administrator` for consistency with PRD/TRD. Added `submission_state`, `pvpi_sent`, `pvpi_sent_at` to `adr_reports`. Added the new `caution_notifications` table for the ADR Head → Administrator flow. Confirmed no dispensing-log table is needed — the Administrator's live caution-status check reuses the existing `high_alerts` table with no write path. Added analytics query patterns for the ADR Head dashboard graphs.
