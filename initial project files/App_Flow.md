# App Flow
## Batch-Level Traceability & Alert System for Drug Adverse Reactions

**Working title:** ADRConnect
**Status:** Draft v2 — for review
**Companion docs:** PRD.md, TRD.md, UI_UX_Design.md
**Note:** Three roles only — Nurse, ADR Head, Administrator. No Doctor role. Barcode scanning still pending viability check — flows below default to search-first.

---

## 1. Nurse App — Full Flow

```
[App Launch] → [Session valid?] ──No──► [Login] ──success──► [Home]
     │Yes
     ▼
  [Home]
     ├──► [My Drafts] ──tap──► [Resume ADR Form at last step]
     ├──► [Recently Submitted] ──tap──► [Read-only ADR view]
     ├──► [+ New Case] ──► [ADR Form Wizard] (creates a fresh case)
     └──► [↩ Follow-up] ──► [Select existing Partial Submit case] ──►
              [ADR Form Wizard, pre-filled, jumps to outcome/recovery fields]


[ADR Form Wizard]
     │
Step 1: Patient Info (required: initials, age, sex; optional: weight)
     ▼
Step 2: Suspected Reaction
     - description field with smart symptom suggestions (tap-to-insert,
       keep typing after)
     - required: reaction start date, description
     ▼
Step 3: Suspected Medication(s)  ◄────────────┐
     │                                         │
  [Search master list] ──found──► auto-fill    │
     │not found                                 │
     ▼                                          │
  [Add new drug/manufacturer/batch]             │
     │                                          │
     ▼                                          │
  [Cross-check runs automatically]              │
     │                                          │
  Prior reactions found? ──Yes──► inline warning│
     │No                              banner    │
     ▼                                          │
  [+ Add another medication] ───────────────────┘
     │
     ▼
Step 4: Reporter Confirmation (auto-filled from login)
     ▼
[Review Screen]
     │
     ├──► [Save as Draft] ──► local DB, status = draft
     │
     ├──► [Partial Submit] ──► local DB, status = pending sync,
     │         submission_state = partial (follow-up pending)
     │
     └──► [Complete Submit] ──► local DB, status = pending sync,
               submission_state = complete (only available directly
               on New Case if recovery is already known, or via a
               later Follow-up entry)
     │
     ▼
[Background Sync Worker — pushes pending records when connectivity
 allows, retries with backoff on failure, never blocks the nurse]
```

## 2. ADR Head App — Full Flow

```
[Login] ──► [Dashboard]
     │
     ├──► Graphs/Analytics panel (reactions by drug/manufacturer,
     │      trend over time, outcome distribution) — always visible
     │      at top, not a separate tab
     │
     ├──► High Alert items — pinned above the regular list regardless
     │      of filter/sort
     │
     ├──► Search/filter bar (manufacturer, batch, ward, date, severity,
     │      submission state: Partial/Complete)
     │
     └──► [Tap any ADR] ──► [ADR Detail]


[ADR Detail]
     ├──► View full submitted form (read-only for nurse-entered fields)
     ├──► [Batch History panel] — other ADRs, same manufacturer/batch
     ├──► [Edit Clinical Fields] ──► Causality Assessment, Action Taken,
     │        Outcome ──► [Save] ──► stored as amendment (audit trail)
     ├──► [Mark Batch High Alert] ──► reason ──► [Confirm]
     ├──► [Mark Sent to Pharmacovigilance] ──► [Confirm] ──► status
     │        shown on dashboard as "Escalated to PvPI"
     └──► [Notify Administrator] ──► select drug/batch ──► short note
              ("use cautiously") ──► [Send] ──► appears in
              Administrator's notification inbox
```

## 3. Administrator App — Full Flow

```
[Login] ──► [Home: two tabs]
     │
     ├──► [Dispensing Lookup]  (the high-frequency daily screen)
     │        │
     │        ▼
     │     [Search drug or batch no.]
     │        │
     │        ▼
     │     Live status returned: Normal / Caution Advised / High Alert
     │        │
     │        ├──Normal──► dispense as usual (no in-app action needed)
     │        │
     │        └──Caution/High Alert──► Administrator decides, verbally,
     │                 to either:
     │                   - dispense with a spoken caution to the nurse, or
     │                   - withhold the drug
     │                 (no record of this decision is saved in-app —
     │                  confirmed as a live check only, not a log)
     │
     └──► [Drug Master List]
              │
              ├──► [Search/browse existing drugs, manufacturers, batches]
              ├──► [+ Add new] (individually, or bulk import if the
              │        seeding-source decision from PRD Section 8
              │        calls for it)
              └──► [Notifications inbox] ──► tap a caution notice from
                       ADR Head ──► [Update entry] ──► sets/edits the
                       caution flag on that drug/batch ──► this is what
                       both (a) the Dispensing Lookup above and (b) the
                       nurse's Step 3 warning banner read from
```

## 4. Cross-Cutting Flow: Offline & Sync Lifecycle

(Unchanged from v1 — applies primarily to the nurse role. ADR Head and Administrator actions assume network availability but should still degrade gracefully, e.g., showing a "couldn't refresh, showing last-known data" state rather than crashing.)

```
[Any local write: draft save, submit, follow-up]
     │
     ▼
[Local DB write — always succeeds instantly]
     │
     ▼
[sync_status = "pending"] → [Sync Worker retries with backoff] →
[sync_status = "synced" + server_id stored]
```

## 5. Edge Cases

| Scenario | Handling |
|---|---|
| App killed/crashes mid-form | Draft auto-saved on every step transition |
| Nurse's session expires while offline | Cached login allows continued local use; re-auth required only when syncing |
| Follow-up entry, but the original Partial Submit case hasn't synced yet from another device | Follow-up attaches locally if the case exists in local cache; otherwise nurse is told to try again once synced — rare edge case at pilot scale (single device per nurse expected) |
| ADR Head marks High Alert while nurse is mid-form offline | Nurse won't see the flag until her next sync — same known latency as v1 |
| Administrator's Dispensing Lookup has no connectivity | Falls back to last-synced local cache of caution flags, clearly labeled "last updated [time]" so the Administrator knows it may not be current |
| Two nurses independently add the same manufacturer/batch with slightly different spelling | Server-side normalization/dedup check on sync; Administrator can merge duplicates in Master List view |
| Barcode scanning doesn't work reliably | Search-first is already the default; no flow change needed if scanning is added or dropped later |

## 6. Next Steps

Once confirmed, next document is the **Backend Schema** (tables, relationships, field types, indexes) — directly implements what's shown in this flow and the TRD's API design.

---
**Revision note (v2):** Removed all Doctor-role flow. Added Administrator's Dispensing Lookup as its own flow (live check, no logging). Added Follow-up flow attaching to existing Partial Submit cases. Added ADR Head's Pharmacovigilance-sent and Notify Administrator actions. Added ADR Head dashboard graphs as a standing panel, not a separate screen.
