"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
    >
      <Printer className="mr-2 h-4 w-4" />
      พิมพ์เอกสาร
    </button>
  );
}
