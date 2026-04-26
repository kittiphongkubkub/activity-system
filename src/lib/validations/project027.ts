import { z } from "zod";

export const project027Schema = z.object({
  actualStartDate: z.string().min(1, "กรุณาระบุวันเริ่มโครงการจริง"),
  actualEndDate: z.string().min(1, "กรุณาระบุวันสิ้นสุดโครงการจริง"),
  actualLocation: z.string().min(3, "กรุณาระบุสถานที่จริง"),
  actualParticipants: z.coerce.number().min(1, "จำนวนผู้เข้าร่วมจริงต้องอย่างน้อย 1 คน"),
  budgetUsed: z.coerce.number().min(0, "งบประมาณที่ใช้จริงต้องไม่ต่ำกว่า 0"),
  outcomeSummary: z.string().min(20, "กรุณาระบุผลการดำเนินงานอย่างน้อย 20 ตัวอักษร"),
  problemsFaced: z.string().optional(),
  suggestions: z.string().optional(),
});

export type Project027Input = z.infer<typeof project027Schema>;
