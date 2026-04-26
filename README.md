<div align="center">

# ✨ ActivityFlow ✨
### Digital Activity Project Management System
*ระบบจัดการเอกสารโครงการกิจกรรมนักศึกษาแบบดิจิทัลครบวงจร*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

<p align="center">
  <b>ActivityFlow</b> คือระบบดิจิทัลที่ออกแบบมาเพื่อยกระดับการจัดการโครงการกิจกรรมนักศึกษา <br/>
  ตั้งแต่การเขียนขออนุมัติ (กนพ.025) ไปจนถึงการสรุปผล (กนพ.027) และการให้คะแนนกิจกรรมโดยอัตโนมัติ
</p>

[Key Features](#-key-features) • [Tech Stack](#%EF%B8%8F-technology-stack) • [Getting Started](#-getting-started) • [Screenshots](#-preview)

</div>

---

## 🚀 Key Features

*   **🛡️ Multi-Stage Workflow (RBAC)**
    *   รองรับทุกระดับตั้งแต่ นักศึกษา, อาจารย์ที่ปรึกษา, หัวหน้าภาควิชา, จนถึงคณบดี
    *   ระบบสิทธิการใช้งานที่ชัดเจนและปลอดภัย (NextAuth.js)
*   **📝 Digital Forms (กนพ.025 / 027)**
    *   สร้าง แก้ไข และส่งโครงการผ่านระบบออนไลน์ 100%
    *   ตรวจสอบสถานะแบบ Real-time ไม่ต้องเดินตามหาเอกสาร
*   **📊 Automated Scoring**
    *   ประมวลผลคะแนนกิจกรรม (Activity Scores) ให้อัตโนมัติเมื่อปิดโครงการ
    *   รายงานสรุปผลคะแนนรายบุคคล
*   **🔔 Real-time Notifications**
    *   แจ้งเตือนทุกครั้งเมื่อมีการขยับสถานะ หรือต้องการการแก้ไข (Revision Required)
*   **📄 PDF Generation**
    *   ส่งออกเอกสารในรูปแบบ PDF ที่ถูกต้องตามระเบียบของมหาวิทยาลัย

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Lucide React, Framer Motion |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Prisma ORM, SQLite (Dev) / PostgreSQL (Prod) |
| **Auth** | NextAuth.js |
| **Validation** | Zod |

---

## 🏁 Getting Started

### 1. การติดตั้ง (Installation)
```bash
git clone https://github.com/kittiphongkubkub/activity-system.git
cd activity-system
npm install
```

### 2. ตั้งค่าฐานข้อมูล (Database Setup)
ตรวจสอบไฟล์ `.env` ของคุณ (ค่าเริ่มต้นเป็น SQLite) จากนั้นรันคำสั่ง:
```bash
npx prisma db push
npm run db:seed
```

### 3. เริ่มต้นระบบ (Run Development Server)
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 👥 Default Test Users

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@example.com` | `password123` |
| **Advisor** | `advisor@example.com` | `password123` |
| **Admin** | `admin@example.com` | `password123` |
| **Dean** | `dean@example.com` | `password123` |

---

## 📸 Preview (Screenshots)

*(กำลังอัปเดตรูปภาพประกอบ...)*

---

<div align="center">
  <sub>Built with ❤️ for University Students</sub>
</div>
