import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // --- 1. CLEANUP ---
  console.log("Cleaning up database...");
  await prisma.notification.deleteMany();
  await prisma.activityScore.deleteMany();
  await prisma.workflowStep.deleteMany();
  await prisma.document.deleteMany();
  await prisma.projectSummary.deleteMany();
  await prisma.project.deleteMany();

  // --- 2. USERS ---
  const users = [
    { email: "student@example.com", fullName: "นายจิรวัฒน์ จุลลวาทีเลิศ", studentId: "65010001", role: "student", department: "สาขาวิชา CD", faculty: "คณะวิชา" },
    { email: "student2@example.com", fullName: "นางสาวใจดี เรียนดี", studentId: "65010002", role: "student", department: "สาขาวิชา CD", faculty: "คณะวิชา" },
    { email: "student3@example.com", fullName: "นายขยัน หมั่นเพียร", studentId: "65010003", role: "student", department: "สาขาวิชา IT", faculty: "คณะวิชา" },
    { email: "advisor@example.com", fullName: "ผศ.สุธีรา พึ่งสวัสดิ์ (อาจารย์ที่ปรึกษา)", role: "advisor", department: "สาขาวิชา CD", faculty: "คณะวิชา" },
    { email: "chair@example.com", fullName: "อาจารย์เปรมรัตน์ พูลสวัสดิ์ (ประธานหลักสูตร)", role: "program_chair", department: "สาขาวิชา CD", faculty: "คณะวิชา" },
    { email: "head@example.com", fullName: "อ. นพมาศ (หัวหน้าสาขาวิชา CD)", role: "dept_head", department: "สาขาวิชา CD", faculty: "คณะวิชา" },
    { email: "dean@example.com", fullName: "อ.ดร.จำรูญศรี พุ่มเทียน (คณบดี)", role: "dean", faculty: "คณะวิชา" },
    { email: "uni@example.com", fullName: "กองพัฒนานักศึกษา (สำนักงานมหาวิทยาลัย)", role: "university", department: "งานกิจกรรมนักศึกษา", faculty: "สำนักงานมหาวิทยาลัย" },
    { email: "admin@example.com", fullName: "ผู้ดูแลระบบ", role: "admin" },
  ];

  const createdUsers: any = {};
  for (const user of users) {
    createdUsers[user.email] = await prisma.user.upsert({
      where: { email: user.email },
      update: { fullName: user.fullName, department: user.department, faculty: user.faculty },
      create: { ...user, passwordHash },
    });
  }

  // --- 3. PROJECT CATEGORIES & ROLES ---
  const projectList = [
    { name: "สัมมนาเทคโนโลยี AI แห่งอนาคต", type: "วิชาการ", status: "under_review", step: "ประธานหลักสูตร", owner: "student@example.com", role: "president", org: "union", impact: "national" },
    { name: "ค่ายอาสาพัฒนาโรงเรียนชนบท", type: "บริการสังคม", status: "under_review", step: "คณบดี", owner: "student@example.com", role: "vp", org: "club", impact: "community" },
    { name: "การแข่งขันบาสเกตบอลคณะสัมพันธ์", type: "กีฬา", status: "under_review", step: "มหาวิทยาลัย", owner: "student2@example.com", role: "committee", org: "working_group", impact: "university" },
    { name: "โครงการสืบสานประเพณีสงกรานต์", type: "ทำนุบำรุงศิลปวัฒนธรรม", status: "completed", step: null, owner: "student@example.com", role: "president", org: "club", impact: "faculty" },
    { name: "Workshop การเขียนโปรแกรม Python", type: "วิชาการ", status: "revision_required", step: "หัวหน้าสาขาวิชา", owner: "student3@example.com", role: "operator", org: "working_group", impact: "faculty" },
    { name: "โครงการจิตอาสาทำความสะอาดวัด", type: "บริการสังคม", status: "approved", step: null, owner: "student2@example.com", role: "participant", org: "club", impact: "community" },
    { name: "งานเปิดตัวนวัตกรรมนักศึกษา", type: "วิชาการ", status: "under_review", step: "อาจารย์ที่ปรึกษา", owner: "student@example.com", role: "president", org: "union", impact: "national" },
    { name: "กีฬาอีสปอร์ตชิงแชมป์มหาวิทยาลัย", type: "กีฬา", status: "under_review", step: "ประชุมคณะ (กบค.)", owner: "student3@example.com", role: "committee", org: "union", impact: "university" },
  ];

  console.log("Seeding projects and approval logs...");
  for (const pData of projectList) {
    const project = await prisma.project.create({
      data: {
        projectName: pData.name,
        projectType: pData.type,
        status: pData.status,
        currentStep: pData.step,
        ownerId: createdUsers[pData.owner].id,
        advisorId: createdUsers["advisor@example.com"].id,
        studentRole: pData.role,
        organizationType: pData.org,
        impactLevel: pData.impact,
        academicYear: "2567",
        semester: 1,
        budgetRequested: Math.floor(Math.random() * 50000) + 5000,
      }
    });

    // Add Approval History for each project
    const workflow = [
      { order: 1, name: "อาจารย์ที่ปรึกษา", role: "advisor", comm: "เห็นชอบในหลักการ" },
      { order: 2, name: "ประธานหลักสูตร", role: "program_chair", comm: "โครงการน่าสนใจมาก ผ่านครับ" },
      { order: 3, name: "หัวหน้าสาขาวิชา", role: "dept_head", comm: "สนับสนุนงบประมาณตามเสนอ" },
      { order: 4, name: "ประชุมคณะ (กบค.)", role: "faculty_committee", comm: "ที่ประชุมมีมติอนุมัติ" },
      { order: 5, name: "คณบดี", role: "dean", comm: "ลงนามอนุมัติ" },
      { order: 6, name: "มหาวิทยาลัย", role: "university", comm: "รับทราบและอนุมัติในระบบ" },
    ];

    const currentStepIdx = workflow.findIndex(w => w.name === pData.step);
    const stopIdx = pData.status === "completed" ? 6 : (currentStepIdx === -1 ? 0 : currentStepIdx);

    for (let i = 0; i < workflow.length; i++) {
      const w = workflow[i];
      let status = "pending";
      if (i < stopIdx) status = "approved";
      else if (i === stopIdx && pData.status === "under_review") status = "in_review";
      else if (i === stopIdx && pData.status === "revision_required") status = "revision_required";

      await prisma.workflowStep.create({
        data: {
          projectId: project.id,
          docType: "025",
          stepOrder: w.order,
          stepName: w.name,
          assigneeRole: w.role,
          status: status,
          comments: status === "approved" ? w.comm : (status === "revision_required" ? "กรุณาปรับปรุงรายละเอียดงบประมาณ" : null),
          assigneeId: status === "approved" ? createdUsers[`${w.role === "faculty_committee" ? "head" : (w.role === "university" ? "uni" : w.role)}@example.com`]?.id : null,
          reviewedAt: status === "approved" ? new Date() : null,
        }
      });
    }

    // Award scores for completed projects
    if (pData.status === "completed") {
      await prisma.activityScore.create({
        data: {
          studentId: createdUsers[pData.owner].id,
          projectId: project.id,
          score: Math.floor(Math.random() * 15) + 10,
          activityType: pData.type,
          notes: `คะแนนสะสมจากโครงการ ${pData.name}`,
        }
      });

      await prisma.projectSummary.create({
        data: {
          projectId: project.id,
          status: "completed",
          budgetUsed: Math.floor(Math.random() * 10000),
          outcomeSummary: "โครงการสำเร็จลุล่วงตามวัตถุประสงค์",
          problemsFaced: "ไม่มี",
        }
      });
    }
  }

  // --- 4. ACCUMULATE SCORE FOR STUDENT 1 (นายสมชาย) TO REACH 85 ---
  console.log("Boosting score for นายสมชาย to show Honor Award...");
  const extraScores = [
    { type: "วิชาการ", score: 25 },
    { type: "บริการสังคม", score: 20 },
    { type: "อื่นๆ", score: 15 },
  ];
  
  for (const es of extraScores) {
    const p = await prisma.project.create({
      data: { projectName: `กิจกรรมสะสมคะแนน ${es.type}`, status: "completed", ownerId: createdUsers["student@example.com"].id, academicYear: "2566" }
    });
    await prisma.activityScore.create({
      data: { studentId: createdUsers["student@example.com"].id, projectId: p.id, score: es.score, activityType: es.type }
    });
  }

  // D. NOTIFICATIONS FOR ALL (ULTRA SEED)
  console.log("Seeding ultra notifications...");
  const allUserEmails = Object.keys(createdUsers);
  
  for (const email of allUserEmails) {
    const user = createdUsers[email];
    
    // Generic welcome for everyone
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "system",
        title: "ยินดีต้อนรับสู่ระบบ ActivityFlow",
        message: `สวัสดีครับคุณ ${user.fullName} ระบบพร้อมใช้งานแล้ววันนี้`,
      }
    });

    // Role specific notifications
    if (user.role === "student") {
      await prisma.notification.createMany({
        data: [
          { userId: user.id, type: "score_awarded", title: "คุณได้รับคะแนนกิจกรรมใหม่", message: "คะแนนจากโครงการสืบสานประเพณีสงกรานต์ถูกบันทึกแล้ว (+15 คะแนน)" },
          { userId: user.id, type: "status_change", title: "โครงการของคุณถูกอนุมัติแล้ว", message: "โครงการกีฬาอีสปอร์ตผ่านการอนุมัติระดับคณะแล้ว" },
          { userId: user.id, type: "status_change", title: "กรุณาแก้ไขโครงการ", message: "อ. เปรม สั่งแก้ไขโครงการ Workshop Python" },
        ]
      });
    } else if (user.role === "advisor" || user.role === "program_chair" || user.role === "dept_head") {
      await prisma.notification.createMany({
        data: [
          { userId: user.id, type: "status_change", title: "มีโครงการใหม่รอการอนุมัติ", message: "นักศึกษาได้ส่งโครงการ AI Seminar 2024 มาถึงคุณแล้ว" },
          { userId: user.id, type: "status_change", title: "มีการแก้ไขโครงการ", message: "นายสมชายได้แก้ไขโครงการและส่งกลับมาให้คุณตรวจอีกครั้ง" },
        ]
      });
    } else if (user.role === "dean" || user.role === "university") {
      await prisma.notification.createMany({
        data: [
          { userId: user.id, type: "status_change", title: "โครงการระดับชาติรอการลงนาม", message: "งานกีฬาสัมพันธ์ 9 สถาบัน ผ่านการกรองจากคณะแล้ว รอคุณพิจารณา" },
        ]
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
