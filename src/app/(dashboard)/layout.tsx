import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <div className="flex-shrink-0 w-72">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
