import { NextRequest, NextResponse } from "next/server";
import GenerativeAI from "@/services/generative-ai";
import { getBaseText } from "@/lib/base-text-store";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const baseText = getBaseText();
    
    if (!baseText) {
      return NextResponse.json(
        { error: "No base text uploaded" },
        { status: 400 }
      );
    }

    const generativeAI = GenerativeAI.getInstance();

    const prompt = `Baseado no texto:\n\n${baseText}\n\nResponda a pergunta: ${question}\n\nResponda apenas se a resposta estiver no texto fornecido. Se a resposta não estiver no texto, responda "Não sei com base nas informações fornecidas."`;

    const answer = await generativeAI.ask(baseText, prompt);
    
    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in /ask route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}