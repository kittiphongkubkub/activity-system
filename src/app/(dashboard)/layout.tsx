import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="flex-shrink-0 w-72 z-10 print:hidden">
        <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col min-w-0 z-10">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth relative">
          <div className="page-transition">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
