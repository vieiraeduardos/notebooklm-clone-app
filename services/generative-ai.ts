import { GoogleGenAI } from "@google/genai";

class GenerativeAI {
    private genAI: GoogleGenAI;
    private model: any;
    private static instance: GenerativeAI;

    private constructor() {
        this.genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY as string,
        });
        this.model = this.genAI.models;
    }

    static getInstance() {
        if (!GenerativeAI.instance) {
            GenerativeAI.instance = new GenerativeAI();
        }
        return GenerativeAI.instance;
    }

    async ask(baseText: string, question: string): Promise<string> {
        try {
            const contents = [
                {
                    role: "user",
                    parts: [
                        { text: baseText }
                    ]
                },
                {
                    role: "user",
                    parts: [
                        { text: question }
                    ]
                }
            ];

            const response = await this.model.generateContentStream({
                model: "gemini-2.5-flash",
                contents,
            });

            let resultText = "";

            for await (const chunk of response) {
                if (chunk.text) {
                    resultText += chunk.text;
                }
            }

            return resultText.trim();

        } catch (err: any) {
            console.error("[GenerativeAI] Error: ", err);
            throw new Error(err.message);
        }
    }
}

export default GenerativeAI;