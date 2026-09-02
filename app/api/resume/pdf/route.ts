import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getResumeData } from "@/lib/resume/get-resume-data";
import PDFRenderer from "@/lib/resume/pdf/PDFRenderer";
import { sanitizeFilename } from "@/lib/resume/pdf/pdf-utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const resumeData = await getResumeData(userId);

    if (!resumeData) {
      return NextResponse.json({ error: "Resume data not found" }, { status: 404 });
    }

    // Render PDF React document into Node.js Buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(PDFRenderer({ data: resumeData }) as any);

    const filename = sanitizeFilename(resumeData.profile.name);

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/resume/pdf error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume PDF" },
      { status: 500 }
    );
  }
}
