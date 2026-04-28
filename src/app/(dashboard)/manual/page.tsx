import { 
  BookOpen, 
  FilePlus, 
  Send, 
  CheckCircle2, 
  Award, 
  Bell, 
  Search,
  ChevronRight,
  Info,
  HelpCircle,
  FileText,
  UserCheck
} from "lucide-react";
import Link from "next/link";

const MANUAL_SECTIONS = [
  {
    id: "getting-started",
    title: "เริ่มต้นใช้งาน",
    icon: BookOpen,
    content: "ยินดีต้อนรับสู่ ActivityFlow ระบบจัดการโครงการกิจกรรมนักศึกษารูปแบบดิจิทัล ระบบนี้ออกแบบมาเพื่อลดความซับซ้อนของเอกสารและเพิ่มความโปร่งใสในทุกขั้นตอน"
  },
  {
    id: "create-project",
    title: "การเสนอโครงการ (025)",
    icon: FilePlus,
    content: "นักศึกษาสามารถเริ่มสร้างโครงการได้จากปุ่ม 'สร้างโครงการใหม่' ในหน้า Dashboard โดยต้องกรอกข้อมูลให้ครบถ้วน เช่น หลักการและเหตุผล, วัตถุประสงค์, งบประมาณ และสถานที่จัดกิจกรรม"
  },
  {
    id: "approval-workflow",
    title: "ขั้นตอนการอนุมัติ",
    icon: UserCheck,
    content: "โครงการที่ส่งแล้วจะเดินทางผ่านสายงานอนุมัติโดยอัตโนมัติ เริ่มจาก 'อาจารย์ที่ปรึกษา' ไปจนถึง 'มหาวิทยาลัย' คุณสามารถติดตามสถานะและดูว่าโครงการอยู่ที่ใครได้ตลอดเวลาในหน้าโครงการ"
  },
  {
    id: "summary-027",
    title: "การสรุปผลโครงการ (027)",
    icon: Send,
    content: "เมื่อกิจกรรมเสร็จสิ้น นักศึกษาต้องส่งแบบสรุปผล (027) พร้อมแนบภาพกิจกรรมหรือเอกสารที่เกี่ยวข้อง เพื่อยืนยันการทำกิจกรรมจริงและขอรับคะแนนกิจกรรม"
  },
  {
    id: "scores",
    title: "คะแนนกิจกรรมและเกียรติบัตร",
    icon: Award,
    content: "หลังจากโครงการได้รับการอนุมัติขั้นสุดท้าย ระบบจะคำนวณคะแนนกิจกรรมเข้าสู่ประวัติของคุณโดยอัตโนมัติ และแจ้งเตือนเมื่อเกียรติบัตรตัวจริงพร้อมให้รับที่มหาวิทยาลัย"
  }
];

export default function ManualPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="relative rounded-[40px] bg-slate-900 p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 -translate-y-24 translate-x-24 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 px-4 py-1.5 rounded-full border border-indigo-500/30">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">Help Center</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-none">
              คู่มือการ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ใช้งานระบบ</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium">
              ศูนย์รวมข้อมูลและขั้นตอนการใช้งานระบบ ActivityFlow <br className="hidden md:block" />
              ที่จะช่วยให้การบริหารจัดการโครงการของคุณง่ายและรวดเร็วกว่าเดิม
            </p>
          </div>
          <div className="h-48 w-48 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
             <BookOpen className="h-24 w-24 text-indigo-400 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Table of Contents</p>
            {MANUAL_SECTIONS.map((section) => (
              <a 
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-600 hover:text-indigo-600 transition-all group"
              >
                <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" />
                <span className="text-sm font-bold">{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-3 space-y-16">
          {MANUAL_SECTIONS.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-32 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                  <section.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Step {index + 1}</p>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{section.title}</h2>
                </div>
              </div>
              
              <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow leading-relaxed">
                <p className="text-slate-600 text-lg font-medium mb-6">
                  {section.content}
                </p>
                
                {section.id === "create-project" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <p className="text-sm text-slate-700">แนบไฟล์ PDF รายละเอียดโครงการ</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <p className="text-sm text-slate-700">ตรวจสอบความถูกต้องของงบประมาณ</p>
                    </div>
                  </div>
                )}

                {section.id === "getting-started" && (
                  <div className="flex items-center space-x-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <Info className="h-6 w-6 text-indigo-500 flex-shrink-0" />
                    <p className="text-sm text-indigo-700 font-medium italic">
                      "หากพบปัญหาในการเข้าสู่ระบบครั้งแรก กรุณาติดต่อกองพัฒนานักศึกษาเพื่อตรวจสอบฐานข้อมูลนักศึกษา"
                    </p>
                  </div>
                )}
              </div>
            </section>
          ))}

          {/* Footer Call to Action */}
          <div className="rounded-[40px] bg-gradient-to-br from-indigo-600 to-purple-600 p-12 text-white text-center shadow-xl shadow-indigo-200">
            <h3 className="text-2xl font-black mb-4">พร้อมเริ่มต้นหรือยัง?</h3>
            <p className="text-indigo-100 mb-8 font-medium">หากคุณเข้าใจขั้นตอนแล้ว มาสร้างโครงการแรกของคุณกันเลย</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/projects/new" className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                สร้างโครงการใหม่
              </Link>
              <Link href="/" className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-sm">
                กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
