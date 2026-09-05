# Implementation Plan
## Batch-Level Traceability & Alert System for Drug Adverse Reactions

**Working title:** ADRConnect
**Status:** Draft v2 — for review
**Companion docs:** PRD.md, TRD.md, UI_UX_Design.md, App_Flow.md, Backend_Schema.md

---

## 1. Build Sequence

| Phase | What | Depends on |
|---|---|---|
| **0. Setup** | Repo, cloud project (DB + hosting per TRD), CI basics, dev environment | — |
| **1. Backend Core** | Auth (JWT + 3 roles), `drug_products`/`manufacturers`/`batches` CRUD, `adr_reports`/`adr_medications` CRUD — matches Backend_Schema.md | Phase 0 |
| **2. Nurse App Core** | Login, Home (New Case / Follow-up / Drafts), ADR Form Wizard, local Drift DB, smart symptom suggestions | Phase 1 |
| **3. Offline Sync** | Background sync worker, pending/synced/failed states, three-state submission model (draft/partial/complete), local cache of drug/batch list | Phase 2 |
| **4. Barcode Integration** | Scan-first flow, fallback to search — **gated on your barcode viability check** | Phase 2 |
| **5. ADR Head App** | Dashboard with graphs, filters, ADR Detail, Batch History, High Alert flow, Mark Sent to Pharmacovigilance, Notify Administrator | Phase 1, 3 |
| **6. Administrator App** | Drug Master List (individual + bulk add), Caution Notifications inbox, **Dispensing Lookup** (live check, no logging) | Phase 1 |
| **7. Cross-Check Feature** | The core "has this batch reacted before?" inline warning — offline-local and server-confirmed | Phase 3, 5 |
| **8. Internal QA** | Manual testing, offline simulation, sync retry testing, dispensing-lookup latency check | Phase 4, 5, 6, 7 |
| **9. Pilot Rollout** | Deploy to real devices, train nurses + ADR Head + Administrator, parallel run alongside paper | Phase 8 |

## 2. Immediate Next Action (Before Phase 4 Work Starts)

Unchanged from v1 — test barcode scanning across every manufacturer currently in ward stock before committing engineering time to the scan-first flow. If inconsistent, search-first simply becomes the sole default with no rework needed elsewhere.

## 3. Rough Timeline (Small/Solo Team)

| Phase | Estimate |
|---|---|
| 0–1 (Setup + Backend Core) | 2 weeks |
| 2 (Nurse App Core) | 2–3 weeks |
| 3–4 (Sync + Barcode) | 1–2 weeks |
| 5 (ADR Head App + graphs) | 1.5–2 weeks |
| 6 (Administrator App + Dispensing Lookup) | 1 week — this is a smaller surface than the ADR Head dashboard, mostly a fast search screen |
| 7 (Cross-Check Feature) | included within Phase 3/5, not separately timed |
| 8 (Internal QA) | 1 week |
| 9 (Pilot Rollout + training) | 2–4 weeks |
| **Total** | **~10–15 weeks** to a working pilot |

## 4. Pilot Rollout Steps

1. **Seed the master list** — Administrator enters current drugs/manufacturers/batches in ward stock before go-live.
2. **Device provisioning** — hospital-issued vs. BYOD, still an open decision (Section 9).
3. **Three short training sessions**, one per role:
   - Nurses: New Case / Follow-up, smart suggestions, medication search, sync indicator (~15–20 min).
   - ADR Head: dashboard/graphs, high-alert flagging, Pharmacovigilance marking, notifying the Administrator (~15–20 min).
   - Administrator: Dispensing Lookup (the daily-use screen — this needs to feel effortless from day one) and Drug Master List management (~15–20 min).
4. **Parallel run (2 weeks recommended)** — nurses fill both the digital form and the existing paper/WhatsApp process simultaneously; Administrator uses the Dispensing Lookup alongside their existing physical process (no behavior change required if the drug isn't flagged).
5. **Feedback loop** — short daily/weekly check-in during parallel run, particularly on whether the Dispensing Lookup is actually fast enough to use in a real hand-off moment (this is the single riskiest UX assumption in the whole plan).
6. **Full switch decision** — made by the ADR Head/hospital admin once parallel-run data shows the digital process is reliable and faster.

## 5. Testing Plan

| Test type | What it covers |
|---|---|
| Backend unit tests | Auth (3 roles), CRUD endpoints, cross-check query logic, analytics aggregation queries |
| Offline simulation | Airplane-mode mid-form, forced app kill mid-submission, sync retry after connection drop |
| Barcode compatibility | Every manufacturer/product currently in ward stock |
| **Dispensing Lookup latency test** | Specifically time how long a search + status check takes end-to-end — if it's not near-instant, the Administrator won't use it during a real hand-off, defeating the feature |
| Field test (pre-pilot) | 2–3 nurses, the ADR Head, and the Administrator each use the app in a controlled setting before full rollout |
| Parallel-run monitoring | Compare digital submissions against paper; separately, informally check whether the Administrator is actually consulting the Dispensing Lookup before handing out flagged drugs |

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Barcode scanning unreliable across manufacturers | Search-first fallback already built into the flow |
| Nurse adoption resistance | Low-friction design, parallel run, short training |
| Ward connectivity poor | Offline-first architecture for the nurse role |
| **Administrator finds Dispensing Lookup too slow/inconvenient to use in practice, reverts to not checking** | This is the main new risk in v2 — mitigate by keeping this screen deliberately minimal (search bar + status, nothing else) and testing its real-world speed before pilot, not just in QA |
| Master list has gaps/typos | Administrator/ADR Head can add on the fly; server-side normalization catches duplicates |
| Device provisioning unresolved | Flagged now, before Phase 9 |

## 7. Success Criteria (from PRD Section 3, restated)

| Metric | Target | How measured |
|---|---|---|
| ADR submission time | Under 3 minutes | Timestamp diff, form-open to submit |
| % of ADRs with valid matched drug/batch | >90% | Server-side: submitted records with valid `batch_id` vs. total |
| Time to identify a repeat-offending batch | Minutes, not days | Manual comparison during parallel run |
| Nurse adoption | >80% digital vs. paper after 4 weeks | Count of digital submissions vs. paper incidents |
| **New: Dispensing Lookup usage rate** | Administrator actually consults it before dispensing a flagged drug, most of the time | Informal observation during parallel run (no in-app log exists to measure this automatically, by design) |

## 8. After the Pilot

Unchanged from v1 — `hospital_id` already in schema for Phase 2 state-level expansion; Phase 3 explores PvPI integration (the in-app "Mark Sent to Pharmacovigilance" status from v2 is a natural stepping stone toward this); Phase 4 procurement linkage remains a stretch goal.

## 9. Open Decisions Carried Forward

1. Drug/manufacturer/batch master list seeding source (PRD Section 8)
2. Hindi/English UI toggle (UI_UX_Design.md Section 6)
3. Barcode viability across all current manufacturers (in progress)
4. `patient_age` as free text vs. structured field (Backend_Schema.md Section 5)
5. High-alert scope: batch-only vs. batch + manufacturer-wide (Backend_Schema.md Section 5)
6. Device provisioning: hospital-issued vs. BYOD (this document, Section 4)
7. `caution_notifications` acknowledgment depth — boolean only, or with a response note (Backend_Schema.md Section 5)
8. Analytics endpoint scope — confirm the three chart types cover what the ADR Head actually wants to see (TRD Section 7)

---
**Revision note (v2):** Split the ADR Head + Administrator build into two separate phases (5 and 6) reflecting their now-distinct roles. Added the Dispensing Lookup as its own build phase, test category, and risk — flagged as the riskiest UX assumption in the plan, since its entire value depends on being fast enough to use in a real physical hand-off moment. Removed all Doctor-role references.
