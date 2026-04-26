import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบจัดการเอกสารโครงการกิจกรรม | Activity Project Management System",
  description: "ระบบดิจิทัลสำหรับขออนุมัติและสรุปผลโครงการกิจกรรมนักศึกษา",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
