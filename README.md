<div align="center">

# ActivityFlow
### Digital Activity Project Management System
*University Project Workflow & Activity Scoring Platform*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

ActivityFlow is a comprehensive digital system designed to streamline university student project workflows,
from initial proposal submission to final reporting and automated activity scoring.

[Key Features](#key-features) • [Tech Stack](#technology-stack) • [Getting Started](#getting-started) • [Default Users](#default-test-users)

</div>

---

## Key Features

### Workflow Management
*   **Role-Based Access Control (RBAC)**
    *   Full support for Students, Advisors, Department Heads, and Deans.
    *   Secure authentication and session management via NextAuth.js.
*   **Digital Project Lifecycle**
    *   End-to-end digital submission for project proposals and summaries.
    *   Real-time status tracking with automated multi-stage approval workflows.

### Automated Scoring & Notifications
*   **Activity Scoring System**
    *   Automated point calculation and distribution upon project completion.
    *   Individual student activity score reports and progress tracking.
*   **Notification Engine**
    *   Automated alerts for status updates, revision requests, and approvals.

### Document Management
*   **PDF Generation**
    *   Export project documents into standardized university PDF formats.
    *   Clean, print-ready document layouts.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Lucide React, Framer Motion |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Prisma ORM, SQLite (Development), PostgreSQL (Production Ready) |
| **Authentication** | NextAuth.js |
| **Validation** | Zod |

---

## Getting Started

### 1. Installation
```bash
git clone https://github.com/kittiphongkubkub/activity-system.git
cd activity-system
npm install
```

### 2. Database Configuration
Ensure your `.env` file is properly configured. For the initial setup:
```bash
npx prisma db push
npm run db:seed
```

### 3. Execution
```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000)

---

## Default Test Users

| Role | Email | Password |
| :--- | :--- | :--- |
| Student | `student@example.com` | `password123` |
| Advisor | `advisor@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |
| Dean | `dean@example.com` | `password123` |

---

## System Preview

*Screenshots and demonstrations are currently being updated.*

---

<div align="center">
  <sub>Advanced Digital Solution for University Activity Management</sub>
</div>
