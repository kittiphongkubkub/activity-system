import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.findFirst({
    where: { role: "student" }
  });

  if (!student) {
    console.error("No student user found. Please create one first.");
    return;
  }

  console.log(`Creating demo summary projects for student: ${student.fullName} (${student.id})`);

  // 1. Project that just got approved (Ready for 027)
  const p1 = await prisma.project.create({
    data: {
      projectName: "โครงการค่ายอาสาพัฒนาชนบท (Demo 027 - Ready)",
      projectType: "ด้านบำเพณประโยชน์หรือรักษาสิ่งแวดล้อม",
      status: "approved",
      academicYear: "2567",
      semester: 1,
      ownerId: student.id,
      department: student.department,
      description: "โครงการเพื่อพัฒนาพื้นที่ห่างไกล",
      objectives: "1. เพื่อช่วยเหลือสังคม",
      plannedStartDate: new Date("2024-06-01"),
      plannedEndDate: new Date("2024-06-05"),
      location: "จังหวัดเชียงราย",
    }
  });

  // 2. Project that has submitted a summary (Under Review 027)
  const p2 = await prisma.project.create({
    data: {
      projectName: "กิจกรรมสัมมนาวิชาการวิศวกรรม (Demo 027 - Submitted)",
      projectType: "ด้านวิชาการที่เสริมสร้างสมรรถนะตามหลักสูตร",
      status: "summary_under_review",
      academicYear: "2567",
      semester: 1,
      ownerId: student.id,
      department: student.department,
      description: "การสัมมนาแลกเปลี่ยนความรู้",
      objectives: "1. เพิ่มพูนทักษะวิชาการ",
      plannedStartDate: new Date("2024-05-10"),
      plannedEndDate: new Date("2024-05-10"),
      location: "ห้องประชุมคณะ",
      currentStep: "อาจารย์ที่ปรึกษา",
      workflowSteps: {
        create: [
          {
            stepName: "อาจารย์ที่ปรึกษา",
            stepOrder: 1,
            docType: "027",
            assigneeRole: "advisor",
            status: "in_review",
          },
          {
            stepName: "งานกิจกรรมนิสิต",
            stepOrder: 2,
            docType: "027",
            assigneeRole: "staff",
            status: "pending",
          }
        ]
      }
    }
  });

  // 3. Project that is completed (027 Done)
  const p3 = await prisma.project.create({
    data: {
      projectName: "แข่งขันกีฬาภายในคณะ (Demo 027 - Completed)",
      projectType: "ด้านสุขภาพ",
      status: "completed",
      academicYear: "2567",
      semester: 1,
      ownerId: student.id,
      department: student.department,
      description: "กิจกรรมกีฬาเพื่อสุขภาพ",
      objectives: "1. สร้างความสามัคคี",
      plannedStartDate: new Date("2024-04-20"),
      plannedEndDate: new Date("2024-04-22"),
      location: "สนามกีฬา",
    }
  });

  console.log("Demo projects created successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
