import { z } from "zod";

export const project025Schema = z.object({
  projectName: z.string().min(5, "ชื่อโครงการต้องมีอย่างน้อย 5 ตัวอักษร"),
  projectType: z.enum([
    "วิชาการ", 
    "บริการสังคม", 
    "กีฬา", 
    "ทำนุบำรุงศิลปวัฒนธรรม", 
    "อื่นๆ"
  ]),
  description: z.string().min(20, "กรุณาอธิบายรายละเอียดโครงการอย่างน้อย 20 ตัวอักษร"),
  objectives: z.string().min(10, "กรุณาระบุวัตถุประสงค์โครงการ"),
  expectedOutcome: z.string().min(10, "กรุณาระบุผลที่คาดว่าจะได้รับ"),
  plannedStartDate: z.string().min(1, "กรุณาระบุวันเริ่มโครงการ"),
  plannedEndDate: z.string().min(1, "กรุณาระบุวันสิ้นสุดโครงการ"),
  location: z.string().min(3, "กรุณาระบุสถานที่จัดโครงการ"),
  expectedParticipants: z.coerce.number().min(1, "จำนวนผู้เข้าร่วมต้องอย่างน้อย 1 คน"),
  budgetRequested: z.coerce.number().min(0, "งบประมาณต้องไม่ต่ำกว่า 0"),
  advisorId: z.string().optional().or(z.literal("")),
  academicYear: z.string().regex(/^\d{4}$/, "ปีการศึกษาต้องเป็นตัวเลข 4 หลัก (เช่น 2567)"),
  semester: z.coerce.number().min(1).max(3, "ภาคการศึกษาต้องเป็น 1, 2 หรือ 3"),
  
  // New fields based on scoring criteria
  organizationType: z.enum(["union", "club", "working_group", "staff"]).optional().default("staff"),
  studentRole: z.enum(["president", "vp", "committee", "operator", "participant", "staff"]).optional().default("staff"),
  impactLevel: z.enum(["national", "community", "university", "faculty", "personal"]),
  presidentEmail: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง").optional().or(z.literal("")),
  userRole: z.string().optional(), // Helper field to pass user role from frontend
}).refine((data) => {
  if (!data.plannedStartDate || !data.plannedEndDate) return true;
  return new Date(data.plannedEndDate) >= new Date(data.plannedStartDate);
}, {
  message: "วันสิ้นสุดโครงการต้องไม่ก่อนวันเริ่มโครงการ",
  path: ["plannedEndDate"],
}).refine((data) => {
  // If user is a student and not a president, presidentEmail is required
  if (data.userRole === "student" && data.studentRole !== "president" && !data.presidentEmail) {
    return false;
  }
  // If user is an advisor, presidentEmail is ALWAYS required (to specify the student president)
  if (data.userRole === "advisor" && !data.presidentEmail) {
    return false;
  }
  return true;
}, {
  message: "กรุณาระบุอีเมลของนักศึกษาที่จะเป็นประธานโครงการ",
  path: ["presidentEmail"],
});

export type Project025Input = z.infer<typeof project025Schema>;
