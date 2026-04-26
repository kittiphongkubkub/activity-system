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

    // In a real production app, you would upload to S3 or Supabase Storage here.
    // For this demonstration, we simulate a successful upload.
    // We return a mock URL and file metadata.
    
    const mockUrl = `https://isfllxclgmfyybjdgurc.supabase.co/storage/v1/object/public/documents/${Date.now()}_${file.name}`;

    return NextResponse.json({
      success: true,
      fileUrl: mockUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
