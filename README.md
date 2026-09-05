# ADRConnect

**ADRConnect** is a role-based Pharmacovigilance and Adverse Drug Reaction (ADR) Management Platform designed to digitize, streamline, and enhance ADR reporting within hospitals. The platform replaces traditional paper-based ADR forms with a centralized web-based system that enables nurses, ADR Heads, and administrators to efficiently report, monitor, analyze, and manage drug-related adverse reactions.

---

## 🚀 Features

### 👩‍⚕️ Nurse Portal

* Create **Initial ADR Reports**
* Submit **Follow-Up Reports** for existing cases
* Save reports as **Draft (Partial Submit)**
* Finalize and submit reports for review
* Smart symptom suggestions (e.g., fever, shivering, vomiting, rash)
* Digital ADR form generation
* View submitted and pending reports

### 🩺 ADR Head Portal

* Review and validate ADR reports
* Track report status:

  * Draft
  * Submitted
  * Under Review
  * Follow-Up Required
  * Closed
* Interactive analytics dashboard
* Drug-wise and batch-wise ADR analysis
* Identify recurring adverse reactions
* Generate High-Risk Drug Alerts
* Forward cases to Pharmacovigilance authorities

### 🛡️ Administrator Portal

* Manage hospital drug inventory
* Add drugs, manufacturers, and batch details
* Monitor high-risk drug alerts
* Issue safety notifications to nurses
* Track flagged manufacturers and batches

---

## 🎯 Problem Statement

Hospitals administer thousands of IV fluids and medications from multiple manufacturers and batches. When adverse drug reactions occur, identifying recurring issues linked to specific drugs, manufacturers, or batches is often difficult due to fragmented records and paper-based reporting systems.

ADRConnect provides a centralized digital platform that improves traceability, accelerates ADR reporting, supports pharmacovigilance activities, and enables early detection of potentially unsafe drugs and batches.

---

## 🏗️ Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Frontend         | Next.js 15, React 19, TypeScript |
| Backend          | Next.js API Routes               |
| Database         | PostgreSQL (Supabase)            |
| ORM              | Prisma                           |
| Authentication   | NextAuth                         |
| Validation       | Zod                              |
| Forms            | React Hook Form                  |
| Charts           | Recharts                         |
| Styling          | Tailwind CSS                     |
| Deployment       | Vercel                           |
| Database Hosting | Supabase                         |

---

## 📂 Project Structure

```text
ADRConnect/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
├── .env
├── .env.local
├── package.json
└── README.md
```

---

## 🗄️ Database Models

The platform uses Prisma ORM with PostgreSQL.

### Core Entities

* Hospital
* User
* DrugProduct
* Manufacturer
* Batch
* AdrReport
* AdrMedication
* HighAlert
* AdrAmendment

### User Roles

```text
nurse
adr_head
admin
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd ADRConnect
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create `.env`

```env
DATABASE_URL="your_postgresql_connection_string"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🛠️ Database Setup

### Generate Prisma Client

```bash
npm run db:generate
```

### Run Migrations

```bash
npx prisma migrate dev --name init
```

### Seed Database

```bash
npm run db:seed
```

### Open Prisma Studio

```bash
npm run db:studio
```

---

## ▶️ Running the Application

Development Mode:

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:3000
```

---

## 📊 Dashboard Analytics

ADRConnect provides:

* Total ADR Reports
* Open Cases
* Closed Cases
* Follow-Up Cases
* High-Risk Drug Analysis
* Manufacturer Analysis
* Batch-Wise ADR Tracking
* Monthly ADR Trends
* Severity Distribution Charts

---

## 🔒 Security Features

* Role-Based Access Control (RBAC)
* Secure Authentication
* Server-Side Authorization
* Input Validation with Zod
* Protected API Routes
* Audit Trail via ADR Amendments
* Secure PostgreSQL Storage

---

## 📈 Future Enhancements

* AI-powered ADR pattern detection
* Automated risk scoring
* Email and SMS alert system
* Multi-hospital deployment
* Regulatory authority integration
* Predictive pharmacovigilance analytics
* Mobile application support

---

## 👥 Team

Developed as a healthcare technology solution to improve patient safety, pharmacovigilance, and adverse drug reaction monitoring through digital transformation.

---

## 📄 License

This project is developed for educational, research, and healthcare innovation purposes.
