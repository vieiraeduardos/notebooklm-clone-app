import { NextRequest, NextResponse } from "next/server";
import { setBaseText } from "@/lib/base-text-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    setBaseText(text || "");

    return NextResponse.json({ 
      message: text ? "Text uploaded successfully" : "Text cleared successfully",
      textLength: text?.length || 0
    });
  } catch (error: any) {
    console.error("Error in /upload-text route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
