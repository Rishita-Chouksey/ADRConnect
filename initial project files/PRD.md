# Product Requirements Document (PRD)
## Batch-Level Traceability & Alert System for Drug Adverse Reactions

**Working title:** ADRConnect *(alt: DrugTrace — open naming decision, see Section 8)*
**Status:** Draft v2 — for review
**Platform:** Android mobile app (MVP), offline-first
**Target user:** Government hospital ward nurses
**Purpose:** Real pilot deployment at a government hospital

---

## 1. Problem Statement

Government hospitals procure IV fluids (RL, NS, D5, DNS, etc.) from multiple manufacturers via tenders. When a patient has an adverse drug reaction (ADR), the nurse hand-fills a paper ADR form and sends a photo of it via WhatsApp to the **ADR Head**. This means:

- The ADR Head has no way to check if the same manufacturer/batch caused a reaction before — there's no searchable history.
- Handwriting on the photo is frequently illegible, especially the batch number.
- Nothing is captured in a structured, searchable system — data is lost the moment the photo is sent.
- No mechanism exists to flag a manufacturer/batch as "high alert" after repeated reactions.

## 2. Goal

Replace the paper + WhatsApp workflow with a mobile app that lets a nurse fill an ADR digitally in under a couple of minutes, and automatically shows the ADR Head whether that manufacturer/batch has a history of prior reactions — enabling faster detection and escalation.

## 3. Success Metrics (Pilot)

| Metric | Target |
|---|---|
| ADR submission time (nurse, ward) | Under 3 minutes per form |
| % of ADRs with a valid, matched manufacturer/batch (vs illegible/unmatched) | >90% |
| Time for ADR Head to identify a repeat-offending batch | Minutes (system-flagged) vs days (manual cross-check) |
| Nurse adoption (forms filed digitally vs still on paper) | >80% within pilot ward after 4 weeks |

## 4. Users & Roles

### 4.1 Nurse / Ward Staff (Primary user)
- Fills ADR form on the mobile app when a patient has a reaction.
- Chooses upfront whether this is a **New (Initial) Case** or a **Follow-up** on an existing case — two distinct entry points from Home, not just a field buried in the form.
- Adds one or more suspected medications (drug/IV fluid given), each with manufacturer/batch selected via search or scan.
- Describes the reaction in free text, with **smart suggestions** for common symptoms (e.g., shivering, fever, breathlessness, vomiting — drawn from real patterns seen in the pilot site's past forms) to speed up entry and improve consistency of what gets recorded.
- Can save as a **draft** mid-emergency and complete later, or do a **partial submit** — see Section 6.1a for the full submission-state model.
- Submits — works offline, syncs when connected.

### 4.2 ADR Head (Reviewer)
- Currently receives all WhatsApp photos; in the new system, receives all digital submissions in one place.
- Dashboard: sees system-flagged alerts ("This manufacturer/batch has X prior reactions"), can take action on a report, and can **mark a batch/manufacturer as danger (High Alert)**.
- **Dashboard includes graphs/visual analytics** — e.g., reactions by drug/manufacturer, trend over time, outcome/severity distribution — so patterns are visible at a glance, not just as a list of individual reports.
- **Sends the report onward to Pharmacovigilance (PvPI)** — an in-app action that marks/tracks a report as escalated, rather than a manual process outside the system (actual submission channel to PvPI is still the existing external one for MVP; see Section 8).
- **Notifies the Administrator** when a specific drug needs to be used cautiously (e.g., "give XYZ drug cautiously") — this is how a clinical concern flows into the master data, rather than the ADR Head editing drug records directly.
- Views full ADR history, searchable by batch, manufacturer, drug, ward, date.

### 4.3 Administrator
- Distinct role from ADR Head (may be the same person at pilot scale — see Section 8), focused on system/data upkeep and drug dispensing rather than clinical review.
- Acts as the drug dispensing point — **nurses come to the Administrator to obtain drugs** (this is the existing physical workflow the app supports, not a new process). Before handing a drug over, the Administrator can check its caution/high-alert status.
- If a drug/batch is flagged for cautious use, the Administrator either **withholds it** or **advises the nurse to use it slowly/cautiously** at the point of handoff — this is the primary moment the caution actually reaches the nurse, earlier than (and in addition to) the warning she'd otherwise see later during ADR form-fill.
- Maintains the master list of drugs, manufacturers, and batches — can add/edit entries individually or in bulk — so nurses have accurate, easy-to-search data when filling the form.
- Receives notifications from the ADR Head about drugs needing cautious use, and updates the relevant drug/batch entry accordingly (e.g., adds a caution note/flag) — this is what then surfaces both at dispensing time (above) and as the existing high-alert warning if the drug is later selected on an ADR form.

## 5. Scope

### 5.0 Standardized Form

The app digitizes the **national PvPI "Suspected Adverse Drug Reaction Reporting Form"** (Indian Pharmacopoeia Commission), standardized on the fuller of the two paper variants in use at the pilot site — the version with Initial/Follow-up Case marker, per-drug Indication, Causality Assessment, and Action Taken columns. This is the more complete, nationally standard layout, so the app won't need rework when expanding beyond the maternal ward in later phases.

### 5.1 In Scope (MVP)
- Nurse: Digital ADR form matching the standardized PvPI layout — patient info, suspected reaction block, repeatable suspected-medication table, reporter details. See Section 6.1 for required vs. optional field breakdown.
- Two distinct entry points on Home: **New Case** and **Follow-up Case** (rather than a field inside a single generic form).
- Smart symptom suggestions in the reaction description field, based on commonly recorded symptoms.
- Manufacturer/batch selection via searchable list; scan barcode/QR if present on bottle; "add new" fallback if not in list.
- Offline entry with local storage; auto-sync when network available.
- Three-state submission model — **Draft** (local, unsubmitted), **Partial Submit** (submitted, follow-up pending), **Complete Submit** (final, recovery recorded) — see Section 6.1a.
- Auto cross-check on submission: system shows nurse and ADR Head if this manufacturer/batch has prior ADRs logged.
- ADR Head dashboard: list/search all ADRs, filter by manufacturer/batch/ward/date/severity; take action, mark a batch/manufacturer as danger (High Alert), mark a report as sent to Pharmacovigilance, and view **graphs/visual analytics** (reactions by drug/manufacturer, trend over time, outcome distribution).
- ADR Head can notify the Administrator that a specific drug needs cautious use.
- ADR Head review screen: complete/edit fields the nurse may have skipped (e.g., Causality Assessment, Action Taken) after clinical review.
- **Administrator drug-dispensing check:** before handing a drug to a nurse, the Administrator can look up its caution/high-alert status and either withhold it or advise cautious/slow use — the primary point at which a flagged drug's risk reaches the nurse.
- High-alert flag: also visible to nurses at point of medication selection during ADR form-fill (a warning, not a block) — a secondary safety net alongside the dispensing check above.
- Administrator: manages drug/manufacturer/batch master list (individual + bulk add), updates entries in response to ADR Head caution notifications.
- Basic auth with three roles: nurse, ADR Head, Administrator (roles may overlap in the same person at pilot scale — see Section 8).

### 5.2 Out of Scope (MVP — future phases)
- Direct API integration with PvPI/CDSCO reporting systems (Phase 3 of scaling roadmap) — MVP tracks escalation status in-app, but actual submission to PvPI still happens through the existing external channel.
- Automatic batch recall triggering (regulatory authority stays outside the app).
- Multi-hospital / state-level data aggregation (Phase 2+).
- iOS app (Android-first for pilot).
- A separate Doctor role/login — not part of this system.
- Procurement system integration (Phase 4, stretch).

## 6. Functional Requirements

### 6.1a Submission States (New/Follow-up Case Flow)

Replaces the earlier simple draft/submit model with three states, matching the intended nurse workflow:

| State | Meaning | Who sees it |
|---|---|---|
| **Draft** | Saved locally, not yet submitted — nurse still filling it out, can be mid-emergency | Only the nurse, until submitted |
| **Partial Submit** | Submitted to the ADR Head, but marked as awaiting follow-up (e.g., recovery outcome not yet known) | ADR Head sees it in the dashboard, flagged "follow-up pending" |
| **Complete Submit** | Final submission — recovery/outcome recorded, case considered closed | ADR Head sees it as resolved |

A **Follow-up** entry (from Home) attaches to an existing Partial Submit case rather than creating a new unrelated record — this lets a nurse (or a different nurse on a later shift) close out a case's recovery outcome without re-entering all the original patient/medication data.

### 6.1 ADR Form Fields — Required vs. Optional

Based on reviewing 11 real filled samples from the pilot site, required fields match what nurses reliably fill today; optional fields match what's routinely left blank or is more of a clinical-review judgment (moved to the ADR Head's review step instead of blocking the nurse).

**A. Patient Information**
| Field | Status |
|---|---|
| Patient Initials | Required |
| Age at time of event / DOB | Required |
| Sex | Required |
| Weight (Kg) | Optional |

**B. Suspected Adverse Reaction**
| Field | Status |
|---|---|
| Initial Case / Follow-up Case | Required (default: Initial) |
| Date reaction started | Required |
| Date of recovery | Optional (can be added later) |
| Describe reaction/problem (free text, with **smart symptom suggestions** — symptoms, relevant diagnosis, immediate treatment given) | Required |
| Other relevant history (allergies, pregnancy, hepatic/renal, etc.) | Optional |
| Seriousness of reaction (Death / Life-threatening / Hospitalization / Disability / Congenital anomaly / Other) | Optional (default: none checked) |
| Outcome (Fatal / Continuing / Recovering / Recovered / Unknown) | Optional (updatable later) |

**C. Suspected Medication(s)** — repeatable table, at least one row required
| Field | Status |
|---|---|
| Name (brand/generic) | Required |
| Manufacturer | Required (selected from master list) |
| Batch/Lot No. | Required (selected/scanned from master list) |
| Expiry Date | Required |
| Dose used, Route used, Frequency | Optional |
| Therapy dates (started/stopped) | Optional |
| Indication / Reason for use | Optional |
| Action taken (withdrawn / dose changed / not applicable / unknown) | Optional — nurse can fill if known; otherwise completed by ADR Head |
| Reaction reappeared after reintroduction (Yes/No/Unknown) | Optional |
| Causality Assessment | **Not shown to nurse** — clinical judgment field, completed by ADR Head on review |

**D. Reporter**
| Field | Status |
|---|---|
| Name & occupation | Required (auto-filled from nurse login) |
| Signature (digital confirmation on submit) | Required |
| Date of report | Required (auto-filled) |
| Pin code, email, phone | Optional |

### 6.2 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR1 | Nurse can log in and see two distinct actions from Home: "New Case" and "Follow-up" | Must |
| FR2 | Nurse can fill ADR form matching Section 6.1's structure, with required fields enforced and optional fields skippable | Must |
| FR3 | Manufacturer/batch fields are selected from a searchable master list, not free text | Must |
| FR4 | Batch no. can be entered via barcode/QR scan if available on the bottle | Should |
| FR5 | Form works fully offline; submissions queue locally and sync automatically when network returns | Must |
| FR6 | Nurse can save an incomplete form as a Draft, or Partial-Submit it (submitted, follow-up pending) per Section 6.1a's state model | Must |
| FR7 | Suspected Medication table supports multiple rows (e.g., IV fluid + Avil + Dexamethasone in one report) | Must |
| FR8 | On submission (or on sync), system checks if selected manufacturer/batch has prior ADRs and shows a non-blocking alert to the nurse | Must |
| FR9 | Reaction description field offers smart suggestions for common symptoms as the nurse types | Should |
| FR10 | A "Follow-up" entry attaches to an existing Partial Submit case rather than creating a new unrelated record | Must |
| FR11 | ADR Head has a dashboard listing all submitted ADRs, sortable/filterable by manufacturer, batch, ward, severity, date, and submission state (Partial/Complete) | Must |
| FR12 | ADR Head can open any ADR and see full history of other ADRs tied to the same manufacturer/batch | Must |
| FR13 | ADR Head can complete/edit optional fields (Causality Assessment, Action Taken, Outcome) after nurse submission | Must |
| FR14 | ADR Head can mark a manufacturer/batch as "High Alert" ("danger") with a reason/note | Must |
| FR15 | High-alert status is visible to nurses when selecting that manufacturer/batch on a new ADR form (warning banner, does not block submission) — a secondary safety net | Must |
| FR16 | ADR Head can mark an ADR report as sent to Pharmacovigilance (in-app status tracking) | Must |
| FR17 | ADR Head can send a notification to the Administrator flagging a specific drug for cautious use | Must |
| FR18 | Administrator can add/edit drug, manufacturer, and batch entries in the master list — individually or in bulk | Must |
| FR19 | Administrator can update a drug/batch entry's caution flag in response to an ADR Head notification | Must |
| FR20 | Administrator can look up a drug/batch's caution status before dispensing it to a nurse — a live check only, no persistent record is kept (drug collection remains a physical, in-person process) | Must |
| FR21 | ADR Head dashboard includes visual analytics: reactions by drug/manufacturer, trend over time, outcome/severity distribution | Should |
| FR22 | System logs submission timestamp, submitting nurse, and sync status for audit purposes | Should |

## 7. Non-Functional Requirements

- **Offline-first:** App must be fully usable with no network; sync is opportunistic, not required at time of entry.
- **Low friction:** Given nurse workload, form completion should require minimal typing — dropdowns/search/scan over free text wherever possible.
- **Data integrity:** No ADR submission should be silently lost; local queue must be visible to the nurse (e.g., "3 pending sync").
- **Simplicity:** MVP has three roles (nurse, ADR Head, Administrator) but ADR Head and Administrator may overlap in the same person at pilot scale — avoid over-engineering permission boundaries beyond what's needed to keep clinical review (ADR Head) separate from data upkeep (Administrator).
- **Auditability:** Every ADR record is immutable once submitted (edits create an amendment, not an overwrite) — important for regulatory credibility.

## 8. Open Assumptions (flagged for your confirmation)

1. **Manufacturer/batch master list source is undecided.** MVP assumption: Administrator manually seeds and maintains this list (no live procurement system integration yet). This directly enables the cross-check feature — confirm before backend schema is finalized.
2. **Single ADR Head per hospital** for MVP (matches current WhatsApp workflow — one person receives everything). If there are actually multiple department heads receiving photos, this needs to change.
3. **Photo attachment field** is included as optional context (e.g., photo of the patient's reaction site) but is **not** used for batch number capture — batch number must always be structured/selected data.
4. ~~ADR Head vs. Administrator — same person or different?~~ **Resolved:** separate logins, two different people.
5. **Naming** — working title is "ADRConnect" (alt: "DrugTrace"); not locked in, purely cosmetic and can be finalized anytime without affecting the build.
6. **Smart symptom suggestions — source list.** MVP assumption: a starter list seeded from patterns in the pilot site's own past forms (shivering, fever, breathlessness, vomiting, etc.), refined over time as more real data comes in — not a large external medical ontology, which would be overkill for MVP.
7. **Pharmacovigilance escalation mechanics** — MVP tracks "sent to Pharmacovigilance" as an in-app status the ADR Head sets; the actual transmission to PvPI still happens through whatever external channel the hospital currently uses (email, portal, etc.), not a live API. Confirm this matches what the ADR Head actually needs day-to-day.
8. ~~Dispensing-check depth~~ **Resolved:** live status lookup only, no persistent dispensing log kept. Drug collection stays a purely physical/in-person process; the app is only a reference tool for the Administrator at that moment.

## 9. Next Steps

Once you confirm/adjust Section 8 assumptions, next document is the **TRD** (tech stack, architecture, sync mechanism, API design) — refine PRD first if anything here doesn't match your intent.

---
**Revision note (v4):** Reframed the Administrator's role around the real physical workflow — nurses obtain drugs from the Administrator, who checks caution/high-alert status *before dispensing* and can withhold or advise cautious use at that point (not just a later in-form warning). Added visual analytics/graphs to the ADR Head dashboard (FR21). Downstream docs (TRD, UI/UX, App Flow, Backend Schema, Implementation Plan) still reflect the earlier model and will need matching updates.
