# Activity Project Management System

A digital workflow system for university project approvals, reporting, and activity scoring.

## 🚀 Features

- **RBAC (Role-Based Access Control)**: Supports Students, Advisors, Program Chairs, Department Heads, Dean, and University administrators.
- **Project Approval (Form 025)**: Full digital submission with automated multi-stage workflow.
- **Project Reporting (Form 027)**: Summary of project outcomes and final budget tracking.
- **Automatic Scoring**: Activity scores are awarded automatically upon project completion.
- **Notification System**: Real-time progress tracking for all participants.
- **Admin Dashboard**: Global statistics and system-wide project oversight.
- **Export to PDF**: Clean, print-friendly views for all university forms.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod

## 🏁 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Database Setup
Ensure your `.env` file is configured (defaults to SQLite). Then run:
```bash
npx prisma db push
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```

## 👥 Default Test Users

| Role | Email | Password |
|------|-------|----------|
| Student | `student@example.com` | `password123` |
| Advisor | `advisor@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |
| Dean | `dean@example.com` | `password123` |

## 📄 License
Internal University Project System.
