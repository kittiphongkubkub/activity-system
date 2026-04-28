import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // --- SECURITY & STABILITY HARDENING ---
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    const ALLOWED_TYPES = [
      "application/pdf", 
      "image/jpeg", 
      "image/png", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
    ];

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "ประเภทไฟล์ไม่ถูกต้อง (อนุญาตเฉพาะ PDF, Word, Excel และรูปภาพ)" }, { status: 400 });
    }
    // --------------------------------------

    // Convert file to Base64 for demonstration purposes
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = buffer.toString("base64");
    const fileUrl = `data:${file.type};base64,${base64File}`;

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
