import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  let filename = searchParams.get("filename") || "annual-report.pdf";

  if (!fileUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  if (!filename.toLowerCase().endsWith(".pdf")) {
    filename += ".pdf";
  }

  try {
    const upstreamRes = await fetch(fileUrl);
    if (!upstreamRes.ok) {
      return new NextResponse("Failed to fetch file from storage", {
        status: upstreamRes.status,
      });
    }

    const contentType =
      upstreamRes.headers.get("content-type") || "application/pdf";
    const cleanFilename = encodeURIComponent(
      filename.replace(/["\r\n\\/]/g, "_")
    );

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${cleanFilename}"; filename*=UTF-8''${cleanFilename}`
    );

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Failed to download PDF proxy:", error);
    return new NextResponse("Error streaming download", { status: 500 });
  }
}
