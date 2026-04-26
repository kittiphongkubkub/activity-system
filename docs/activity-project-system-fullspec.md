# ระบบจัดการเอกสารโครงการกิจกรรม (Activity Project Management System)
## เอกสารสเปคโปรเจกฉบับสมบูรณ์

---

# สารบัญ

1. [ภาพรวมโปรเจก (Project Overview)](#1-ภาพรวมโปรเจก)
2. [Tech Stack ที่แนะนำ](#2-tech-stack)
3. [โครงสร้างฐานข้อมูล (Database Schema)](#3-database-schema)
4. [โครงสร้างโปรเจก (Project Structure)](#4-project-structure)
5. [API Endpoints](#5-api-endpoints)
6. [Workflow & Business Logic](#6-workflow--business-logic)
7. [หน้าจอและ UI Components](#7-ui--screens)
8. [Authentication & Roles](#8-authentication--roles)
9. [ไฟล์ Config ที่สำคัญ](#9-config-files)
10. [แผนการพัฒนา (Development Plan)](#10-development-plan)
11. [Environment Variables](#11-environment-variables)
12. [คำแนะนำ Deployment](#12-deployment)

---

# 1. ภาพรวมโปรเจก

## ชื่อระบบ
**ระบบจัดการเอกสารโครงการกิจกรรม (Activity Project Management System)**

## วัตถุประสงค์
แปลงกระบวนการเอกสารจริงของมหาวิทยาลัยให้เป็นระบบดิจิทัล ครอบคลุม:
- แบบ 025 — ขออนุมัติจัดโครงการ
- แบบ 027 — สรุปผลโครงการ
- Workflow การอนุมัติตามลำดับชั้น
- ติดตามสถานะ + สรุปคะแนนกิจกรรมนักศึกษา

## ผู้ใช้งานหลัก (Actors)
| Role | หน้าที่ |
|------|--------|
| นักศึกษา (Student) | ยื่นขออนุมัติ, ส่งสรุปผล, ดูสถานะ |
| อาจารย์ที่ปรึกษา (Advisor) | ตรวจสอบเบื้องต้น |
| ประธานหลักสูตร (Program Chair) | อนุมัติขั้นที่ 1 |
| หัวหน้าสาขา (Department Head) | อนุมัติขั้นที่ 2 |
| คณบดี (Dean) | อนุมัติขั้นสุดท้าย |
| มหาวิทยาลัย (University Admin) | รับทราบ/อนุมัติระดับสูงสุด |
| Admin | จัดการระบบ |

---

# 2. Tech Stack

## แนะนำ Stack: Next.js + Supabase (Full-Stack)

### Frontend
```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS + shadcn/ui
State:         Zustand หรือ React Query (TanStack Query)
Forms:         React Hook Form + Zod validation
File Upload:   UploadThing หรือ Supabase Storage
Charts:        Recharts
Icons:         Lucide React
```

### Backend
```
API:           Next.js API Routes (หรือ Express.js แยกต่างหาก)
Database:      PostgreSQL (via Supabase)
ORM:           Prisma
Auth:          NextAuth.js หรือ Supabase Auth
File Storage:  Supabase Storage
Email:         Nodemailer หรือ Resend
```

### DevOps
```
Hosting:       Vercel (Frontend) + Supabase (DB)
Version Control: Git + GitHub
CI/CD:         GitHub Actions
```

## ทางเลือกสำหรับมหาวิทยาลัย (On-premise)
```
Frontend:  React + Vite
Backend:   Node.js + Express
Database:  PostgreSQL หรือ MySQL
Auth:      JWT
Server:    Ubuntu VPS / ติดตั้งเอง
```

---

# 3. Database Schema

## ER Diagram (อธิบาย)
```
users ──────< projects >───── workflow_steps
  │               │
  │           documents
  │               │
  └── activity_scores    project_summaries
```

## SQL Schema (PostgreSQL)

### ตาราง users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  student_id    VARCHAR(20),           -- สำหรับนักศึกษา
  role          VARCHAR(50) NOT NULL,  -- student, advisor, program_chair, dept_head, dean, university, admin
  department    VARCHAR(100),
  faculty       VARCHAR(100),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### ตาราง projects
```sql
CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name      VARCHAR(500) NOT NULL,
  project_type      VARCHAR(100),       -- วิชาการ, บริการสังคม, กีฬา, ทำนุบำรุง
  description       TEXT,
  objectives        TEXT,
  expected_outcome  TEXT,
  
  -- วัน/เวลา/สถานที่
  planned_start_date DATE,
  planned_end_date   DATE,
  location           VARCHAR(500),
  
  -- จำนวนคน/งบ
  expected_participants INT,
  budget_requested  DECIMAL(12,2),
  
  -- เจ้าของโปรเจก
  owner_id          UUID REFERENCES users(id),
  advisor_id        UUID REFERENCES users(id),
  department        VARCHAR(100),
  academic_year     VARCHAR(10),        -- เช่น 2567
  semester          INT,               -- 1 หรือ 2
  
  -- สถานะ
  status            VARCHAR(50) DEFAULT 'draft',
  -- draft | submitted | under_review | revision_required | approved | rejected | in_progress | summary_submitted | summary_under_review | completed | cancelled
  
  current_step      VARCHAR(100),       -- ขั้นตอนปัจจุบันในการอนุมัติ
  
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

### ตาราง documents
```sql
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  doc_type      VARCHAR(10) NOT NULL,    -- 025 | 027
  version       INT DEFAULT 1,          -- V1, V2, V3...
  file_name     VARCHAR(500),
  file_url      TEXT,                   -- URL จาก Storage
  file_size     INT,                    -- bytes
  mime_type     VARCHAR(100),
  uploaded_by   UUID REFERENCES users(id),
  is_current    BOOLEAN DEFAULT true,   -- version ล่าสุด
  notes         TEXT,                   -- หมายเหตุผู้อัปโหลด
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### ตาราง workflow_steps
```sql
CREATE TABLE workflow_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  doc_type       VARCHAR(10),           -- 025 | 027
  step_order     INT NOT NULL,          -- ลำดับขั้นตอน 1-6
  step_name      VARCHAR(100) NOT NULL, -- ชื่อขั้นตอน
  assignee_role  VARCHAR(50) NOT NULL,  -- role ที่ต้องอนุมัติ
  assignee_id    UUID REFERENCES users(id),  -- คนที่รับผิดชอบจริง
  
  status         VARCHAR(50) DEFAULT 'pending',
  -- pending | in_review | approved | rejected | revision_required
  
  comments       TEXT,                 -- ความเห็น/เหตุผล
  reviewed_at    TIMESTAMP,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);
```

### ตาราง project_summaries (แบบ 027)
```sql
CREATE TABLE project_summaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- ผลการดำเนินงาน
  actual_start_date DATE,
  actual_end_date   DATE,
  actual_location   VARCHAR(500),
  actual_participants INT,
  budget_used       DECIMAL(12,2),
  
  -- เนื้อหาสรุป
  outcome_summary   TEXT,
  problems_faced    TEXT,
  suggestions       TEXT,
  
  -- สถานะ
  status            VARCHAR(50) DEFAULT 'draft',
  submitted_by      UUID REFERENCES users(id),
  submitted_at      TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

### ตาราง activity_scores
```sql
CREATE TABLE activity_scores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES users(id),
  project_id   UUID REFERENCES projects(id),
  activity_type VARCHAR(100),           -- ประเภทกิจกรรม
  score        DECIMAL(5,2),
  notes        TEXT,
  awarded_at   TIMESTAMP DEFAULT NOW(),
  awarded_by   UUID REFERENCES users(id)
);
```

### ตาราง notifications
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  project_id  UUID REFERENCES projects(id),
  type        VARCHAR(100),    -- approval_required | approved | rejected | revision_needed | completed
  title       VARCHAR(500),
  message     TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

# 4. Project Structure

## โครงสร้างโฟลเดอร์ (Next.js App Router)

```
activity-project-system/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               ← Sidebar + Topbar
│   │   ├── page.tsx                 ← Dashboard หลัก
│   │   ├── projects/
│   │   │   ├── page.tsx             ← รายการโครงการ
│   │   │   ├── new/
│   │   │   │   └── page.tsx         ← กรอกแบบ 025
│   │   │   └── [id]/
│   │   │       ├── page.tsx         ← รายละเอียดโครงการ
│   │   │       ├── workflow/
│   │   │       │   └── page.tsx     ← Timeline การอนุมัติ
│   │   │       └── summary/
│   │   │           └── page.tsx     ← กรอกแบบ 027
│   │   ├── approvals/
│   │   │   └── page.tsx             ← หน้าสำหรับผู้อนุมัติ
│   │   ├── activity-scores/
│   │   │   └── page.tsx             ← สรุปคะแนนกิจกรรม
│   │   └── admin/
│   │       ├── users/
│   │       └── reports/
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       ├── projects/
│       │   ├── route.ts             ← GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts         ← GET, PUT, DELETE
│       │       ├── submit/route.ts  ← ส่งขออนุมัติ
│       │       ├── approve/route.ts ← อนุมัติ
│       │       ├── reject/route.ts  ← ปฏิเสธ
│       │       └── summary/route.ts ← ส่งสรุปผล
│       ├── documents/
│       │   └── upload/route.ts      ← อัปโหลดไฟล์
│       └── notifications/
│           └── route.ts
├── components/
│   ├── ui/                          ← shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   ├── projects/
│   │   ├── ProjectForm025.tsx       ← ฟอร์มแบบ 025
│   │   ├── ProjectForm027.tsx       ← ฟอร์มแบบ 027
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectTable.tsx
│   │   ├── WorkflowTimeline.tsx     ← แสดง step การอนุมัติ
│   │   ├── StatusBadge.tsx
│   │   └── DocumentUpload.tsx
│   ├── approvals/
│   │   ├── ApprovalCard.tsx
│   │   └── ApprovalModal.tsx
│   └── dashboard/
│       ├── PhaseCards.tsx
│       └── ScoreSummary.tsx
├── lib/
│   ├── db.ts                        ← Prisma client
│   ├── auth.ts                      ← NextAuth config
│   ├── workflow.ts                  ← Workflow logic
│   ├── notifications.ts
│   └── validations/
│       ├── project025.ts            ← Zod schema
│       └── project027.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
├── hooks/
│   ├── useProjects.ts
│   ├── useWorkflow.ts
│   └── useNotifications.ts
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

# 5. API Endpoints

## Projects API

### GET /api/projects
ดึงรายการโครงการของผู้ใช้
```
Query Params:
  status    = draft | submitted | approved | completed
  page      = 1
  limit     = 20
  search    = ค้นหาชื่อโครงการ

Response:
{
  data: Project[],
  total: number,
  page: number,
  totalPages: number
}
```

### POST /api/projects
สร้างโครงการใหม่ (บันทึกร่าง)
```
Body: {
  project_name: string
  project_type: string
  description: string
  objectives: string
  planned_start_date: string
  planned_end_date: string
  location: string
  expected_participants: number
  budget_requested: number
  advisor_id: string
}

Response: { id: string, ...project }
```

### GET /api/projects/[id]
รายละเอียดโครงการ + workflow + documents
```
Response: {
  project: Project,
  workflow_steps: WorkflowStep[],
  documents: Document[],
  summary: ProjectSummary | null
}
```

### POST /api/projects/[id]/submit
ส่งขออนุมัติ (เปลี่ยนสถานะเป็น submitted + สร้าง workflow steps)
```
Body: { document_id: string }
Response: { success: true, workflow_steps: WorkflowStep[] }
```

### POST /api/projects/[id]/approve
อนุมัติ (เฉพาะผู้มีสิทธิ์)
```
Body: {
  step_id: string
  comments: string
}
Response: { success: true, next_step: WorkflowStep | null }
```

### POST /api/projects/[id]/reject
ปฏิเสธหรือส่งกลับแก้ไข
```
Body: {
  step_id: string
  reason: string
  revision_required: boolean
}
Response: { success: true }
```

### POST /api/projects/[id]/summary
ส่งสรุปผล (แบบ 027)
```
Body: {
  actual_start_date: string
  actual_end_date: string
  actual_participants: number
  budget_used: number
  outcome_summary: string
  problems_faced: string
  suggestions: string
}
Response: { success: true, summary_id: string }
```

### POST /api/documents/upload
อัปโหลดไฟล์เอกสาร
```
Body: FormData {
  file: File
  project_id: string
  doc_type: "025" | "027"
  notes?: string
}
Response: {
  document_id: string
  file_url: string
  version: number
}
```

---

# 6. Workflow & Business Logic

## Workflow สำหรับแบบ 025 (ขออนุมัติ)

```
ขั้นตอน  | step_order | assignee_role      | ชื่อขั้นตอน
---------|------------|--------------------|--------------
1        | 1          | advisor            | อาจารย์ที่ปรึกษา
2        | 2          | program_chair      | ประธานหลักสูตร
3        | 3          | dept_head          | หัวหน้าสาขา
4        | 4          | faculty_committee  | ประชุมคณะ
5        | 5          | dean               | คณบดี
6        | 6          | university         | มหาวิทยาลัย
```

## Workflow สำหรับแบบ 027 (สรุปผล)
```
ขั้นตอน  | step_order | assignee_role      | ชื่อขั้นตอน
---------|------------|--------------------|--------------
1        | 1          | advisor            | อาจารย์ที่ปรึกษา
2        | 2          | program_chair      | ประธานหลักสูตร
3        | 3          | dept_head          | หัวหน้าสาขา
4        | 4          | faculty_committee  | ประชุมคณะ
5        | 5          | dean               | คณบดี
6        | 6          | university         | มหาวิทยาลัย
```

> หมายเหตุ: Workflow ของแบบ 025 และ 027 ใช้ขั้นตอนเดียวกันทั้งหมด 6 ขั้นตอน

## Status Transition Map
```
draft
  └─► submitted           (นักศึกษาส่ง)
        └─► under_review  (ระหว่างพิจารณา)
              ├─► revision_required  (ส่งกลับแก้)
              │     └─► submitted   (นักศึกษาส่งใหม่ = V2)
              ├─► rejected          (ปฏิเสธ)
              └─► approved          (อนุมัติครบ)
                    └─► summary_submitted    (ส่ง 027)
                          └─► summary_under_review
                                ├─► summary_revision
                                └─► completed  (ปิดโครงการ)
```

## Workflow Logic (lib/workflow.ts)
```typescript
// ฟังก์ชันหลักในการสร้าง workflow steps
export async function createWorkflowSteps(
  projectId: string,
  docType: "025" | "027"
) {
  const steps025 = [
    { step_order: 1, step_name: "อาจารย์ที่ปรึกษา", assignee_role: "advisor" },
    { step_order: 2, step_name: "ประธานหลักสูตร", assignee_role: "program_chair" },
    { step_order: 3, step_name: "หัวหน้าสาขา", assignee_role: "dept_head" },
    { step_order: 4, step_name: "ประชุมคณะ", assignee_role: "faculty_committee" },
    { step_order: 5, step_name: "คณบดี", assignee_role: "dean" },
    { step_order: 6, step_name: "มหาวิทยาลัย", assignee_role: "university" },
  ]
  
  // 025 และ 027 ใช้ workflow เดียวกัน
  const steps027 = [
    { step_order: 1, step_name: "อาจารย์ที่ปรึกษา", assignee_role: "advisor" },
    { step_order: 2, step_name: "ประธานหลักสูตร", assignee_role: "program_chair" },
    { step_order: 3, step_name: "หัวหน้าสาขา", assignee_role: "dept_head" },
    { step_order: 4, step_name: "ประชุมคณะ", assignee_role: "faculty_committee" },
    { step_order: 5, step_name: "คณบดี", assignee_role: "dean" },
    { step_order: 6, step_name: "มหาวิทยาลัย", assignee_role: "university" },
  ]
  
  const steps = docType === "025" ? steps025 : steps027
  
  // สร้าง steps ใน database
  // ขั้นตอนแรก = in_review, ที่เหลือ = pending
  await prisma.workflowStep.createMany({
    data: steps.map((step, index) => ({
      project_id: projectId,
      doc_type: docType,
      ...step,
      status: index === 0 ? "in_review" : "pending",
    }))
  })
}

// ฟังก์ชันอนุมัติแต่ละขั้น
export async function approveStep(
  stepId: string,
  approverId: string,
  comments: string
) {
  const step = await prisma.workflowStep.findUnique({
    where: { id: stepId },
    include: { project: true }
  })
  
  // อัปเดต step ปัจจุบัน
  await prisma.workflowStep.update({
    where: { id: stepId },
    data: {
      status: "approved",
      assignee_id: approverId,
      comments,
      reviewed_at: new Date()
    }
  })
  
  // หา step ถัดไป
  const nextStep = await prisma.workflowStep.findFirst({
    where: {
      project_id: step.project_id,
      doc_type: step.doc_type,
      step_order: step.step_order + 1
    }
  })
  
  if (nextStep) {
    // เปิด step ถัดไป
    await prisma.workflowStep.update({
      where: { id: nextStep.id },
      data: { status: "in_review" }
    })
    // แจ้งเตือนผู้รับผิดชอบ step ถัดไป
    await notifyNextApprover(nextStep)
  } else {
    // ทุก step เสร็จแล้ว = อนุมัติสมบูรณ์
    await prisma.project.update({
      where: { id: step.project_id },
      data: { status: "approved" }
    })
    await notifyProjectOwner(step.project_id, "approved")
  }
}
```

---

# 7. UI & Screens

## รายการหน้าจอทั้งหมด

### สำหรับนักศึกษา
| หน้า | Path | คำอธิบาย |
|------|------|---------|
| Login | /login | เข้าสู่ระบบ |
| Dashboard | / | ภาพรวม โครงการของฉัน |
| My Projects | /projects | รายการโครงการทั้งหมด |
| New Project (025) | /projects/new | กรอกแบบ 025 |
| Project Detail | /projects/[id] | รายละเอียด + สถานะ |
| Workflow Status | /projects/[id]/workflow | Timeline การอนุมัติ |
| Submit Summary (027) | /projects/[id]/summary | กรอกแบบ 027 |
| Activity Score | /activity-scores | คะแนนกิจกรรมสะสม |

### สำหรับผู้อนุมัติ
| หน้า | Path | คำอธิบาย |
|------|------|---------|
| Approvals Queue | /approvals | รายการที่รอการพิจารณา |
| Approve/Reject | /approvals/[stepId] | ตรวจสอบและอนุมัติ |

## Component หลักที่ต้องสร้าง

### WorkflowTimeline Component
```typescript
// components/projects/WorkflowTimeline.tsx
interface WorkflowStep {
  id: string
  step_order: number
  step_name: string
  status: "pending" | "in_review" | "approved" | "rejected" | "revision_required"
  assignee?: { full_name: string }
  comments?: string
  reviewed_at?: Date
}

// แสดงเป็น vertical timeline
// - approved = สีเขียว + checkmark
// - in_review = สีน้ำเงิน + loading indicator
// - pending = สีเทา
// - rejected = สีแดง
// - revision_required = สีส้ม
```

### StatusBadge Component
```typescript
// components/projects/StatusBadge.tsx
const statusConfig = {
  draft:                    { label: "ร่าง",              color: "gray" },
  submitted:                { label: "ส่งแล้ว",           color: "blue" },
  under_review:             { label: "กำลังพิจารณา",      color: "blue" },
  revision_required:        { label: "ต้องแก้ไข",         color: "orange" },
  approved:                 { label: "อนุมัติแล้ว",       color: "green" },
  rejected:                 { label: "ปฏิเสธ",            color: "red" },
  summary_submitted:        { label: "ส่งสรุปผลแล้ว",     color: "purple" },
  completed:                { label: "ปิดโครงการ",        color: "green" },
}
```

### Zod Validation Schema (025)
```typescript
// lib/validations/project025.ts
import { z } from "zod"

export const project025Schema = z.object({
  project_name: z.string().min(5, "ชื่อโครงการต้องมีอย่างน้อย 5 ตัวอักษร"),
  project_type: z.enum(["วิชาการ", "บริการสังคม", "กีฬา", "ทำนุบำรุงศิลปวัฒนธรรม", "อื่นๆ"]),
  description: z.string().min(20, "กรุณาอธิบายโครงการ"),
  objectives: z.string().min(10, "กรุณาระบุวัตถุประสงค์"),
  planned_start_date: z.string(),
  planned_end_date: z.string(),
  location: z.string().min(3, "กรุณาระบุสถานที่"),
  expected_participants: z.number().min(1).max(10000),
  budget_requested: z.number().min(0),
  advisor_id: z.string().uuid("กรุณาเลือกอาจารย์ที่ปรึกษา"),
})

export type Project025Input = z.infer<typeof project025Schema>
```

---

# 8. Authentication & Roles

## NextAuth Config (lib/auth.ts)
```typescript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user) return null
        
        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,        // ← เก็บ role ไว้ใน session
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role  // ← ส่ง role ไปยัง client
      return session
    }
  }
}
```

## Role-based Access Control (RBAC)
```typescript
// lib/rbac.ts
export const permissions = {
  // นักศึกษา
  student: [
    "project:create",
    "project:read:own",
    "project:update:own:draft",
    "document:upload",
    "summary:submit",
    "score:read:own",
  ],
  
  // ผู้อนุมัติ (ทุก role ได้)
  advisor: [
    "project:read:department",
    "workflow:approve",
    "workflow:reject",
    "workflow:request_revision",
  ],
  
  // admin
  admin: ["*"],  // ทุกอย่าง
}

// Middleware ตรวจสอบสิทธิ์
export function requireRole(...roles: string[]) {
  return (session: Session) => {
    if (!roles.includes(session.user.role)) {
      throw new Error("Unauthorized")
    }
  }
}
```

---

# 9. Config Files

## package.json
```json
{
  "name": "activity-project-system",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:seed": "npx ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/bcryptjs": "^2.4.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  fullName      String   @map("full_name")
  studentId     String?  @map("student_id")
  role          String
  department    String?
  faculty       String?
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  ownedProjects    Project[]      @relation("ProjectOwner")
  advisedProjects  Project[]      @relation("ProjectAdvisor")
  workflowSteps    WorkflowStep[]
  documents        Document[]
  notifications    Notification[]
  activityScores   ActivityScore[]
  
  @@map("users")
}

model Project {
  id                  String   @id @default(uuid())
  projectName         String   @map("project_name")
  projectType         String?  @map("project_type")
  description         String?
  objectives          String?
  expectedOutcome     String?  @map("expected_outcome")
  plannedStartDate    DateTime? @map("planned_start_date")
  plannedEndDate      DateTime? @map("planned_end_date")
  location            String?
  expectedParticipants Int?    @map("expected_participants")
  budgetRequested     Decimal? @map("budget_requested")
  ownerId             String   @map("owner_id")
  advisorId           String?  @map("advisor_id")
  department          String?
  academicYear        String?  @map("academic_year")
  semester            Int?
  status              String   @default("draft")
  currentStep         String?  @map("current_step")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  owner          User           @relation("ProjectOwner", fields: [ownerId], references: [id])
  advisor        User?          @relation("ProjectAdvisor", fields: [advisorId], references: [id])
  workflowSteps  WorkflowStep[]
  documents      Document[]
  summary        ProjectSummary?
  activityScores ActivityScore[]
  notifications  Notification[]
  
  @@map("projects")
}

model WorkflowStep {
  id           String    @id @default(uuid())
  projectId    String    @map("project_id")
  docType      String    @map("doc_type")
  stepOrder    Int       @map("step_order")
  stepName     String    @map("step_name")
  assigneeRole String    @map("assignee_role")
  assigneeId   String?   @map("assignee_id")
  status       String    @default("pending")
  comments     String?
  reviewedAt   DateTime? @map("reviewed_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  project  Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee User?   @relation(fields: [assigneeId], references: [id])
  
  @@map("workflow_steps")
}

model Document {
  id          String   @id @default(uuid())
  projectId   String   @map("project_id")
  docType     String   @map("doc_type")
  version     Int      @default(1)
  fileName    String?  @map("file_name")
  fileUrl     String?  @map("file_url")
  fileSize    Int?     @map("file_size")
  mimeType    String?  @map("mime_type")
  uploadedBy  String   @map("uploaded_by")
  isCurrent   Boolean  @default(true) @map("is_current")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  
  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  uploader   User    @relation(fields: [uploadedBy], references: [id])
  
  @@map("documents")
}

model ProjectSummary {
  id                 String    @id @default(uuid())
  projectId          String    @unique @map("project_id")
  actualStartDate    DateTime? @map("actual_start_date")
  actualEndDate      DateTime? @map("actual_end_date")
  actualLocation     String?   @map("actual_location")
  actualParticipants Int?      @map("actual_participants")
  budgetUsed         Decimal?  @map("budget_used")
  outcomeSummary     String?   @map("outcome_summary")
  problemsFaced      String?   @map("problems_faced")
  suggestions        String?
  status             String    @default("draft")
  submittedBy        String?   @map("submitted_by")
  submittedAt        DateTime? @map("submitted_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")
  
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@map("project_summaries")
}

model ActivityScore {
  id           String   @id @default(uuid())
  studentId    String   @map("student_id")
  projectId    String   @map("project_id")
  activityType String?  @map("activity_type")
  score        Decimal
  notes        String?
  awardedAt    DateTime @default(now()) @map("awarded_at")
  awardedBy    String?  @map("awarded_by")
  
  student User    @relation(fields: [studentId], references: [id])
  project Project @relation(fields: [projectId], references: [id])
  
  @@map("activity_scores")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  projectId String?  @map("project_id")
  type      String
  title     String
  message   String?
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")
  
  user    User     @relation(fields: [userId], references: [id])
  project Project? @relation(fields: [projectId], references: [id])
  
  @@map("notifications")
}
```

---

# 10. Development Plan

## Phase 1 — Foundation (สัปดาห์ที่ 1-2)
```
✅ ตั้งค่า Next.js + TypeScript + Tailwind
✅ ตั้งค่า Prisma + PostgreSQL (Supabase)
✅ สร้าง Database Tables ทั้งหมด
✅ Seed ข้อมูลทดสอบ (users แต่ละ role)
✅ ระบบ Login / Logout (NextAuth)
✅ Middleware ตรวจสอบ role
✅ Layout: Sidebar + Topbar
```

## Phase 2 — Core Features (สัปดาห์ที่ 3-4)
```
✅ หน้า Dashboard
✅ กรอกแบบ 025 (พร้อม validation)
✅ อัปโหลดไฟล์เอกสาร
✅ ส่งขออนุมัติ + สร้าง workflow steps
✅ หน้า My Projects (รายการ + ฟิลเตอร์)
✅ WorkflowTimeline component
```

## Phase 3 — Approval System (สัปดาห์ที่ 5-6)
```
✅ หน้า Approvals Queue (สำหรับผู้อนุมัติ)
✅ อนุมัติ / ปฏิเสธ / ส่งกลับแก้
✅ ระบบ Notification (in-app)
✅ Version เอกสาร (V1, V2)
✅ Email notification (optional)
```

## Phase 4 — Summary & Completion (สัปดาห์ที่ 7-8)
```
✅ กรอกแบบ 027 (สรุปผล)
✅ Approval workflow สำหรับ 027
✅ ปิดโครงการ
✅ คำนวณและบันทึกคะแนนกิจกรรม
✅ หน้า Activity Score Summary
```

## Phase 5 — Polish & Deploy (สัปดาห์ที่ 9-10)
```
✅ Admin dashboard
✅ Export รายงาน (PDF/Excel)
✅ Responsive design (mobile)
✅ Testing (unit + integration)
✅ Deploy บน Vercel + Supabase
✅ User manual
```

---

# 11. Environment Variables

## .env.local
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/activity_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Supabase (ถ้าใช้)
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# File Storage (Supabase Storage bucket name)
STORAGE_BUCKET="project-documents"

# Email (ถ้าต้องการส่ง email notification)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@university.ac.th"
```

---

# 12. Deployment

## Option A: Vercel + Supabase (แนะนำสำหรับเริ่มต้น)
```bash
# 1. Push code ขึ้น GitHub
git init
git add .
git commit -m "initial commit"
git push origin main

# 2. สร้าง project ใน Supabase
#    - ได้ DATABASE_URL + storage bucket

# 3. Deploy บน Vercel
#    - connect GitHub repo
#    - ใส่ environment variables
#    - vercel deploy
```

## Option B: Self-hosted (Ubuntu VPS)
```bash
# ติดตั้ง
sudo apt update && sudo apt install -y nodejs npm postgresql nginx

# Setup database
sudo -u postgres createdb activity_db
sudo -u postgres createuser activity_user

# Clone และ setup
git clone <repo> /var/www/activity-system
cd /var/www/activity-system
npm install
npx prisma db push
npm run build

# PM2 สำหรับ process management
npm install -g pm2
pm2 start npm --name "activity-system" -- start
pm2 startup
pm2 save

# Nginx reverse proxy
# /etc/nginx/sites-available/activity-system
server {
    listen 80;
    server_name yourdomain.ac.th;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

# สรุป Checklist ก่อนเริ่มสร้าง

## ✅ Prerequisites
- [ ] Node.js 18+ ติดตั้งแล้ว
- [ ] PostgreSQL หรือ Supabase account พร้อม
- [ ] Git ติดตั้งแล้ว
- [ ] VS Code + Extensions (Prisma, TypeScript, Tailwind)

## ✅ คำสั่งเริ่มต้นโปรเจก
```bash
npx create-next-app@latest activity-project-system \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir

cd activity-project-system
npm install @prisma/client prisma next-auth bcryptjs zod react-hook-form @hookform/resolvers zustand @tanstack/react-query lucide-react recharts date-fns
npm install -D @types/bcryptjs

npx prisma init
# แก้ DATABASE_URL ใน .env
# วาง schema ลงใน prisma/schema.prisma
npx prisma db push
npx prisma db seed
```

---

*เอกสารนี้จัดทำขึ้นเพื่อเป็น blueprint สำหรับการพัฒนาระบบจัดการเอกสารโครงการกิจกรรม*
*สามารถปรับ tech stack และรายละเอียดตามความเหมาะสมของมหาวิทยาลัย*
