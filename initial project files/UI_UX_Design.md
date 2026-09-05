# UI/UX Design
## Batch-Level Traceability & Alert System for Drug Adverse Reactions

**Working title:** ADRConnect
**Status:** Draft v2 — for review
**Companion docs:** PRD.md, TRD.md

---

## 1. Design Principles

1. **One-handed, thumb-first** (nurse screens especially) — primary actions in easy thumb-reach at the bottom.
2. **Interruptible by design** — every nurse screen is safely abandon-able mid-task (draft auto-saves locally).
3. **Minimize typing, maximize picking** — search-and-select over free-text wherever the PRD allows it.
4. **Status must be glanceable** — sync status, high-alert warnings, draft/pending counts visible without opening a menu.
5. **High-contrast, large touch targets** for ward conditions (bright/dim lighting, gloves).
6. **Never block on network** — no spinner that traps the nurse; sync happens invisibly.
7. **Administrator's dispensing lookup must be near-instant** — it happens live, at the moment of physically handing a drug to a nurse, so any delay defeats its purpose.

## 2. Information Architecture

```
Nurse
├── Login
├── Home
│   ├── New Case (primary action)
│   ├── Follow-up (attaches to an existing Partial Submit case)
│   ├── My Drafts
│   └── Sync status indicator
├── ADR Form Wizard
│   ├── Step 1: Patient Info
│   ├── Step 2: Suspected Reaction (with smart symptom suggestions)
│   ├── Step 3: Suspected Medication(s) — repeatable, search or scan
│   ├── Step 4: Reporter confirmation
│   └── Review & Submit (Partial or Complete)
└── Submitted ADR (read-only, own submissions)

ADR Head
├── Login
├── Dashboard
│   ├── Graphs/Analytics (reactions by drug/manufacturer, trend over time, outcome distribution)
│   ├── List/search/filter all ADRs
│   └── High Alert items pinned to top
├── ADR Detail
│   ├── Full form as submitted
│   ├── Batch History (other ADRs, same manufacturer/batch)
│   ├── Mark High Alert (with reason)
│   ├── Mark Sent to Pharmacovigilance
│   ├── Notify Administrator (flag a drug for cautious use)
│   └── Clinical review fields (Causality Assessment, Action Taken, Outcome)

Administrator
├── Login
├── Drug Master List
│   ├── Search/browse drugs, manufacturers, batches
│   ├── Add new (individually or bulk)
│   └── Caution notifications inbox (from ADR Head) → update relevant entry
└── Dispensing Lookup (core daily-use screen)
    └── Search a drug/batch → live caution/high-alert status →
        decide: dispense normally / dispense with caution advice / withhold
        (no record is kept of this check, per confirmed decision)
```

## 3. Key Screens

### 3.1 Nurse — Home
```
┌─────────────────────────────┐
│  ● Synced          [profile] │
│                               │
│   ┌─────────────────────┐   │
│   │   + New Case          │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │   ↩ Follow-up          │   │
│   └─────────────────────┘   │
│                               │
│   Drafts (2)                 │
│   Recently submitted          │
└─────────────────────────────┘
```

### 3.2 Nurse — Suspected Reaction (Step 2, smart suggestions)
```
┌─────────────────────────────┐
│  ← Suspected Reaction     2/4 │
│                               │
│  Describe reaction:            │
│  ┌─────────────────────┐   │
│  │ shiv|                  │   │  ← as she types...
│  └─────────────────────┘   │
│  Suggestions:                 │
│  [Shivering]  [Fever]         │  ← tap to insert, keep typing after
│  [Breathlessness] [Vomiting]  │
│                               │
│         [Continue →]          │
└─────────────────────────────┘
```

### 3.3 Nurse — Suspected Medication (unchanged core mechanic from v1)
```
┌─────────────────────────────┐
│  ← Suspected Medication   3/4 │
│                               │
│  [🔍 Search drug/manufacturer]│
│  Name: Dextrose 5D             │
│  Manufacturer: Vision Parenteral│
│  Batch: MP251001073            │
│  Exp: 09/2028                  │
│  ⚠ 2 prior reactions reported │
│     to this batch — [view]    │
│                               │
│  [+ Add another medication]   │
│         [Continue →]          │
└─────────────────────────────┘
```

### 3.4 ADR Head — Dashboard (now with graphs)
```
┌─────────────────────────────┐
│  ADR Reports        [filter] │
│  🔍 Search batch/manufacturer │
│                               │
│  🔴 HIGH ALERT (1)            │
│                               │
│  ┌── Reactions by Drug ────┐│
│  │  ▇▇▇▇▇  Dextrose 5D      ││   ← bar chart
│  │  ▇▇▇   Normal Saline      ││
│  │  ▇     Avil                ││
│  └─────────────────────────┘│
│  ┌── Trend Over Time ──────┐│
│  │   ╱╲___╱╲__╱             ││   ← line chart
│  └─────────────────────────┘│
│                               │
│  All Reports                 │
│  [K/A · Dextrose 5D · Partial]│
│  [J/M · Normal Saline · Complete]│
└─────────────────────────────┘
```

### 3.5 ADR Head — ADR Detail
```
┌─────────────────────────────┐
│  ← ADR: Patient K/A            │
│  [full submitted form]        │
│                               │
│  ── Batch History ──          │
│  3 ADRs tied to this batch    │
│  [Mark Batch High Alert]      │
│  [Mark Sent to Pharmacovigilance]│
│  [Notify Administrator: use   │
│   cautiously]                 │
│                               │
│  ── Clinical Review ──        │
│  Causality Assessment: [___]  │
│  Action Taken: [dropdown]     │
│  Outcome: [dropdown]          │
└─────────────────────────────┘
```

### 3.6 Administrator — Dispensing Lookup (new, core daily screen)
```
┌─────────────────────────────┐
│  Dispensing Check              │
│  🔍 [search drug or batch no.] │
│                               │
│  Dextrose 5D                   │
│  Vision Parenteral · MP251...  │
│                               │
│  ⚠ CAUTION ADVISED             │
│  "Use slowly — 2 prior         │
│   reactions reported"          │
│                               │
│  [Dispense with caution noted  │
│   verbally]  [Withhold]        │
│                               │
│  (No record of this check is  │
│   saved — live status only)   │
└─────────────────────────────┘
```
This is the screen the Administrator actually uses several times a day — it needs to be the fastest, lowest-friction screen in the entire app, since it sits directly in the physical drug hand-off moment.

### 3.7 Administrator — Master List & Caution Notifications
```
┌─────────────────────────────┐
│  Drug Master List    [+ Add]  │
│  🔍 [search]                  │
│                               │
│  Notifications from ADR Head  │
│  ┌─────────────────────┐   │
│  │ "Use Dextrose 5D        │   │
│  │  MP2510... cautiously"  │   │
│  │  [Update entry →]       │   │
│  └─────────────────────┘   │
│                               │
│  All Drugs / Manufacturers /  │
│  Batches (searchable list)    │
└─────────────────────────────┘
```

## 4. Visual Style
(unchanged from v1 — deep teal/green primary, red/orange reserved for High Alert and sync failure, minimum 16sp text, 48dp touch targets.)

## 5. Accessibility & Ergonomics
(unchanged from v1 — glove-friendly, interruption-safe, high-contrast, bilingual toggle still an open question below.)

## 6. Open Questions

1. **Hindi/English toggle** — still open from v1.
2. **Scan-first vs. search-first default** — still pending your barcode viability check; search-first is the safe current default across all screens.
3. **Chart types on ADR Head dashboard (Section 3.4)** — I've defaulted to a bar chart (reactions by drug) and a line chart (trend over time); confirm if an outcome-distribution pie chart should also be on the main dashboard or a secondary "analytics" tab, to avoid overcrowding the screen.

## 7. Next Steps

Once confirmed, next document is **App Flow** (full navigation/state diagrams covering nurse, ADR Head, and Administrator journeys, including offline/sync edge cases) — followed by **Backend Schema**, then **Implementation Plan**.

---
**Revision note (v2):** Removed Doctor role entirely. Added Administrator's Dispensing Lookup screen (live check, no logging, per your confirmed decision) as a distinct, high-frequency-use screen separate from the Drug Master List. Added ADR Head dashboard graphs, Pharmacovigilance-sent action, and Notify Administrator action. Updated Nurse Home to show New Case / Follow-up as two distinct actions, and added smart symptom suggestions to Step 2.
