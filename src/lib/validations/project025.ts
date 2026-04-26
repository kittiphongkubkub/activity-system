import { z } from "zod";

export const project025Schema = z.object({
  projectName: z.string().min(5, "ชื่อโครงการต้องมีอย่างน้อย 5 ตัวอักษร"),
  projectType: z.enum([
    "วิชาการ", 
    "บริการสังคม", 
    "กีฬา", 
    "ทำนุบำรุงศิลปวัฒนธรรม", 
    "อื่นๆ"
  ], {
    required_error: "กรุณาเลือกประเภทโครงการ",
  }),
  description: z.string().min(20, "กรุณาอธิบายรายละเอียดโครงการอย่างน้อย 20 ตัวอักษร"),
  objectives: z.string().min(10, "กรุณาระบุวัตถุประสงค์โครงการ"),
  expectedOutcome: z.string().min(10, "กรุณาระบุผลที่คาดว่าจะได้รับ"),
  plannedStartDate: z.string().min(1, "กรุณาระบุวันเริ่มโครงการ"),
  plannedEndDate: z.string().min(1, "กรุณาระบุวันสิ้นสุดโครงการ"),
  location: z.string().min(3, "กรุณาระบุสถานที่จัดโครงการ"),
  expectedParticipants: z.coerce.number().min(1, "จำนวนผู้เข้าร่วมต้องอย่างน้อย 1 คน"),
  budgetRequested: z.coerce.number().min(0, "งบประมาณต้องไม่ต่ำกว่า 0"),
  advisorId: z.string().uuid("กรุณาเลือกอาจารย์ที่ปรึกษา"),
  academicYear: z.string().regex(/^\d{4}$/, "ปีการศึกษาต้องเป็นตัวเลข 4 หลัก (เช่น 2567)"),
  semester: z.coerce.number().min(1).max(3, "ภาคการศึกษาต้องเป็น 1, 2 หรือ 3"),
  
  // New fields based on scoring criteria
  organizationType: z.enum(["union", "club", "working_group"], {
    required_error: "กรุณาเลือกประเภทองค์กรที่จัด",
  }),
  studentRole: z.enum(["president", "vp", "committee", "operator", "participant"], {
    required_error: "กรุณาเลือกบทบาทของคุณในโครงการ",
  }),
  impactLevel: z.enum(["national", "community", "university", "faculty", "personal"], {
    required_error: "กรุณาเลือกระดับผลกระทบของโครงการ",
  }),
});

export type Project025Input = z.infer<typeof project025Schema>;
