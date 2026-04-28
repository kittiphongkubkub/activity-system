# คู่มือการติดตั้งโปรเจกต์สำหรับนักพัฒนา (Local Setup Guide)

คู่มือนี้จัดทำขึ้นเพื่อให้ตัวแทนนักพัฒนาสามารถติดตั้งและรันโปรเจกต์ระบบบริหารจัดการโครงการกิจกรรมบนเครื่องคอมพิวเตอร์ส่วนบุคคลได้ตั้งแต่เริ่มต้น

---

## สรุปขั้นตอนแบบเร็ว (TL;DR)
1. ติดตั้ง Node.js (v18+) และ PostgreSQL
2. `git clone` โปรเจกต์ลงมา
3. `npm install`
4. สร้างไฟล์ `.env` และตั้งค่าฐานข้อมูล
5. `npx prisma db push` และ `npx prisma db seed`
6. `npm run dev`

---

## ส่วนที่ 1: ความต้องการของระบบ (System Requirements)
ก่อนเริ่มต้น โปรดตรวจสอบว่าเครื่องของคุณมีการติดตั้งซอฟต์แวร์ดังต่อไปนี้:
- **Node.js:** เวอร์ชัน 18.x หรือสูงกว่า (แนะนำ LTS)
- **ตัวจัดการแพ็กเกจ:** npm (ติดตั้งมาพร้อม Node.js)
- **ฐานข้อมูล:** PostgreSQL (แนะนำ) หรือ MySQL
- **Git:** สำหรับการ Clone โปรเจกต์จาก Repository

---

## ส่วนที่ 2: ขั้นตอนการติดตั้ง (Step-by-Step Setup)

### 1. การ Clone โปรเจกต์
เปิด Terminal หรือ Command Prompt แล้วรันคำสั่ง:
```bash
git clone <url-ของ-repository>
cd activity-project-system-fullspec
```

### 2. การติดตั้ง Dependencies
```bash
npm install
```

### 3. การตั้งค่า Environment Variables
คัดลอกไฟล์ตัวอย่างเพื่อสร้างไฟล์ `.env`:
```bash
cp .env.example .env
```
*หากไม่มีไฟล์ตัวอย่าง ให้สร้างไฟล์ชื่อ `.env` ไว้ที่ Root ของโปรเจกต์ และดูรายละเอียดในส่วนที่ 3*

### 4. การจัดการฐานข้อมูลด้วย Prisma
รันคำสั่งเพื่อสร้าง Table ในฐานข้อมูลและสร้าง Prisma Client:
```bash
# อัปเดตโครงสร้างฐานข้อมูล
npx prisma db push

# สร้างไฟล์ข้อมูลเริ่มต้น (ถ้ามี)
npx prisma db seed
```

---

## ส่วนที่ 3: การตั้งค่าไฟล์ .env (Environment Variables)

ไฟล์ `.env` จะต้องมีตัวแปรสำคัญดังนี้:

| ตัวแปร | รายละเอียด | ตัวอย่างค่า |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL สำหรับเชื่อมต่อฐานข้อมูล | `postgresql://user:password@localhost:5432/dbname` |
| `DIRECT_URL` | URL เชื่อมต่อตรง (สำหรับ Supabase) | `postgresql://user:password@localhost:5432/dbname` |
| `NEXTAUTH_SECRET` | คีย์สำหรับเข้ารหัส Session | `random_string_at_least_32_chars` |
| `NEXTAUTH_URL` | URL ของแอปพลิเคชัน | `http://localhost:3000` |

### ตัวอย่างไฟล์ .env:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/activity_db?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/activity_db?schema=public"
NEXTAUTH_SECRET="y0ur-v3ry-s3cr3t-k3y-h3r3"
NEXTAUTH_URL="http://localhost:3000"
```

---

## ส่วนที่ 4: การรันแอปพลิเคชัน (Running the System)

เมื่อตั้งค่าทุกอย่างเรียบร้อยแล้ว ให้เริ่มเซิร์ฟเวอร์สำหรับพัฒนา:
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่: `http://localhost:3000`

### การทดสอบระบบ:
- หากรัน Seed แล้ว คุณสามารถใช้ User ทดสอบที่อยู่ในไฟล์ `prisma/seed.ts`
- โดยปกติจะเป็นอีเมลนักศึกษาหรืออีเมลแอดมินตามที่ระบุในสคริปต์

---

## ส่วนที่ 5: ปัญหาที่พบบ่อยและวิธีแก้ไข (Troubleshooting)

### 1. Prisma Error: P1001 (Can't reach database)
- **สาเหตุ:** ฐานข้อมูลยังไม่ได้เปิดใช้งาน หรือ DATABASE_URL ใน .env ผิด
- **วิธีแก้:** ตรวจสอบว่า PostgreSQL รันอยู่ และตรวจสอบ Username/Password ใน .env

### 2. Port 3000 already in use
- **วิธีแก้:** ปิดโปรเซสเดิมที่รันอยู่ หรือรันด้วยพอร์ตอื่นโดยใช้ `npm run dev -- -p 3001`

### 3. NextAuth: Session issues / Login failed
- **วิธีแก้:** ตรวจสอบว่าค่า NEXTAUTH_SECRET ถูกต้องและมีการกำหนด NEXTAUTH_URL ไว้

---

## ส่วนที่ 6: เทคนิคการพัฒนา (Development Tips)

- **การ Reset ฐานข้อมูลใหม่ทั้งหมด:**
  ```bash
  npx prisma migrate reset
  ```
- **การเปิดดูข้อมูลผ่าน UI (Prisma Studio):**
  ```bash
  npx prisma studio
  ```
  *คำสั่งนี้จะเปิดเว็บเบราว์เซอร์ให้คุณจัดการข้อมูลในฐานข้อมูลได้โดยตรง*

---

## ส่วนที่ 7: โครงสร้างโฟลเดอร์ (Folder Structure Overview)

```text
activity-project-system/
├── prisma/             # Schema ฐานข้อมูลและสคริปต์ Seed
├── src/
│   ├── app/            # Next.js App Router (Pages & API)
│   ├── components/     # UI Components แยกตามส่วนงาน
│   ├── lib/            # Utilities, Database client, Auth config
│   ├── hooks/          # Custom React Hooks
│   └── types/          # TypeScript Definitions
├── public/             # Static assets (Images, Fonts)
└── .env                # ไฟล์เก็บความลับระบบ (ห้ามส่งขึ้น Git)
```

---

## ส่วนที่ 8: การ Build สำหรับ Production (Optional)

หากต้องการทดสอบการรันแบบ Production บนเครื่อง Local:
```bash
npm run build
npm start
```

---
*จัดทำโดย: ฝ่ายพัฒนาวิศวกรรมระบบ (Senior DevOps Engineer)*
