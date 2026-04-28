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
    { email: "committee@example.com", fullName: "คณะกรรมการประชุมคณะ (กบค.)", role: "faculty_committee", faculty: "คณะวิชา" },
    { email: "university@example.com", fullName: "กองพัฒนานักศึกษา (สำนักงานมหาวิทยาลัย)", role: "university", department: "งานกิจกรรมนักศึกษา", faculty: "สำนักงานมหาวิทยาลัย" },
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
    // --- 027 MOCKUP DATA ---
    { name: "โครงการอบรมเชิงปฏิบัติการ Internet of Things (IoT)", type: "วิชาการ", status: "approved", step: null, owner: "student@example.com", role: "president", org: "working_group", impact: "university" },
    { name: "ค่ายคอมพิวเตอร์และเทคโนโลยีเพื่อน้อง", type: "บริการสังคม", status: "summary_under_review", step: "อาจารย์ที่ปรึกษา (สรุปผล)", owner: "student2@example.com", role: "vp", org: "club", impact: "community" },
    { name: "กิจกรรมวิ่งการกุศลเพื่อการศึกษา", type: "กีฬา", status: "summary_revision_required", step: "อาจารย์ที่ปรึกษา (สรุปผล)", owner: "student3@example.com", role: "committee", org: "working_group", impact: "community" },
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

    // --- 025 Workflow (Always exists for these statuses) ---
    const workflow025 = [
      { order: 1, name: "อาจารย์ที่ปรึกษา", role: "advisor", comm: "เห็นชอบในหลักการ" },
      { order: 2, name: "ประธานหลักสูตร", role: "program_chair", comm: "โครงการน่าสนใจมาก ผ่านครับ" },
      { order: 3, name: "หัวหน้าสาขาวิชา", role: "dept_head", comm: "สนับสนุนงบประมาณตามเสนอ" },
      { order: 4, name: "ประชุมคณะ (กบค.)", role: "faculty_committee", comm: "ที่ประชุมมีมติอนุมัติ" },
      { order: 5, name: "คณบดี", role: "dean", comm: "ลงนามอนุมัติ" },
      { order: 6, name: "มหาวิทยาลัย", role: "university", comm: "รับทราบและอนุมัติในระบบ" },
    ];

    const currentStep025Idx = workflow025.findIndex(w => w.name === pData.step);
    const stopIdx025 = (pData.status === "completed" || pData.status.startsWith("summary") || pData.status === "approved") ? 6 : (currentStep025Idx === -1 ? 0 : currentStep025Idx);

    for (let i = 0; i < workflow025.length; i++) {
      const w = workflow025[i];
      let status = "pending";
      if (i < stopIdx025) status = "approved";
      else if (i === stopIdx025 && pData.status === "under_review") status = "in_review";
      else if (i === stopIdx025 && pData.status === "revision_required") status = "revision_required";

      await prisma.workflowStep.create({
        data: {
          projectId: project.id,
          docType: "025",
          stepOrder: w.order,
          stepName: w.name,
          assigneeRole: w.role,
          status: status,
          comments: status === "approved" ? w.comm : (status === "revision_required" ? "กรุณาปรับปรุงรายละเอียดงบประมาณ" : null),
          assigneeId: status === "approved" ? createdUsers[`${w.role === "faculty_committee" ? "committee" : (w.role === "university" ? "uni" : (w.role === "program_chair" ? "chair" : (w.role === "dept_head" ? "head" : w.role)))}@example.com`]?.id : null,
          reviewedAt: status === "approved" ? new Date() : null,
        }
      });
    }

    // --- 027 Workflow & Summary (If applicable) ---
    if (pData.status.startsWith("summary_") || pData.status === "completed") {
      const workflow027 = [
        { order: 1, name: "อาจารย์ที่ปรึกษา (สรุปผล)", role: "advisor", comm: "ผลการดำเนินงานเป็นไปตามแผน" },
        { order: 2, name: "ประธานหลักสูตร (สรุปผล)", role: "program_chair", comm: "เรียบร้อยดีครับ" },
        { order: 3, name: "หัวหน้าสาขาวิชา (สรุปผล)", role: "dept_head", comm: "รับทราบผลการดำเนินงาน" },
        { order: 4, name: "ประชุมคณะ (สรุปผล)", role: "faculty_committee", comm: "รับทราบ" },
        { order: 5, name: "คณบดี (สรุปผล)", role: "dean", comm: "รับทราบผลการดำเนินงาน" },
        { order: 6, name: "มหาวิทยาลัย (สรุปผล)", role: "university", comm: "บันทึกข้อมูลเรียบร้อย" },
      ];

      const currentStep027Idx = workflow027.findIndex(w => w.name === pData.step);
      const stopIdx027 = pData.status === "completed" ? 6 : (currentStep027Idx === -1 ? 0 : currentStep027Idx);

      for (let i = 0; i < workflow027.length; i++) {
        const w = workflow027[i];
        let status = "pending";
        if (i < stopIdx027) status = "approved";
        else if (i === stopIdx027 && pData.status === "summary_under_review") status = "in_review";
        else if (i === stopIdx027 && pData.status === "summary_revision_required") status = "revision_required";

        await prisma.workflowStep.create({
          data: {
            projectId: project.id,
            docType: "027",
            stepOrder: w.order,
            stepName: w.name,
            assigneeRole: w.role,
            status: status,
            comments: status === "approved" ? w.comm : (status === "summary_revision_required" ? "กรุณาแนบรูปภาพกิจกรรมเพิ่มเติม" : null),
            assigneeId: status === "approved" ? createdUsers[`${w.role === "faculty_committee" ? "committee" : (w.role === "university" ? "uni" : (w.role === "program_chair" ? "chair" : (w.role === "dept_head" ? "head" : w.role)))}@example.com`]?.id : null,
            reviewedAt: status === "approved" ? new Date() : null,
          }
        });
      }

      // Create Project Summary
      await prisma.projectSummary.create({
        data: {
          projectId: project.id,
          actualStartDate: new Date(),
          actualEndDate: new Date(),
          actualLocation: "สถานที่จัดงานจริง",
          actualParticipants: 50,
          budgetUsed: Math.floor(Math.random() * 10000),
          outcomeSummary: "โครงการสำเร็จลุล่วงตามวัตถุประสงค์ มีนักศึกษาให้ความสนใจเป็นจำนวนมาก",
          problemsFaced: "ไม่มี",
          status: pData.status === "completed" ? "completed" : "submitted",
          submittedBy: createdUsers[pData.owner].id,
          submittedAt: new Date(),
        }
      });

      // Create Audit Logs for mockup data
      await prisma.auditLog.createMany({
        data: [
          {
            projectId: project.id,
            userId: createdUsers[pData.owner].id,
            action: "submit",
            fromStatus: "draft",
            toStatus: "submitted",
            stepName: "นักศึกษา",
            createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
          },
          {
            projectId: project.id,
            userId: createdUsers["advisor@example.com"].id,
            action: "approve",
            fromStatus: "submitted",
            toStatus: "under_review",
            stepName: "อาจารย์ที่ปรึกษา",
            createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
          }
        ]
      });
    } else if (pData.status === "approved" || pData.status === "under_review") {
       await prisma.auditLog.create({
        data: {
          projectId: project.id,
          userId: createdUsers[pData.owner].id,
          action: "submit",
          fromStatus: "draft",
          toStatus: "submitted",
          stepName: "นักศึกษา",
          createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
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
          { userId: user.id, type: "status_change", title: "กรุณาแก้ไขสรุปผลโครงการ", message: "โครงการกิจกรรมวิ่งการกุศลฯ ถูกส่งกลับมาแก้ไขสรุปผล (027)" },
        ]
      });
    } else if (user.role === "advisor" || user.role === "program_chair" || user.role === "dept_head") {
      await prisma.notification.createMany({
        data: [
          { userId: user.id, type: "status_change", title: "มีโครงการใหม่รอการอนุมัติ", message: "นักศึกษาได้ส่งโครงการ AI Seminar 2024 มาถึงคุณแล้ว" },
          { userId: user.id, type: "status_change", title: "มีการแก้ไขโครงการ", message: "นายสมชายได้แก้ไขโครงการและส่งกลับมาให้คุณตรวจอีกครั้ง" },
          { userId: user.id, type: "status_change", title: "มีสรุปผลโครงการรอการอนุมัติ (027)", message: "โครงการค่ายคอมพิวเตอร์ฯ ส่งสรุปผลมาถึงคุณแล้ว" },
        ]
      });
    }
 else if (user.role === "dean" || user.role === "university") {
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
