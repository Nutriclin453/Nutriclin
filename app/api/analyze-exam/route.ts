import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { text, file, mimeType } = await req.json();

    if (!text && !file) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Configuração de IA ausente. Verifique a chave de API Gemini." }, { status: 500 });
    }

    try {
      let contents: any[] = [];
      if (file && mimeType) {
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: file,
          }
        });
        contents.push({ text: "Analise este laudo laboratorial. Identifique: 1. Tipo de exame principal. 2. Data do exame (se não encontrar, deixe vazio ou use a data atual no formato YYYY-MM-DD). 3. Um resumo objetivo dos resultados e métricas. Retorne em JSON." });
      } else if (text) {
        contents.push({ text: `Analise o seguinte texto de um laudo laboratorial e extraia as informações essenciais. Identifique o tipo de exame principal, a data do exame e forneça um resumo objetivo das métricas principais ou alterações encontradas. \n\nTexto: ${text}` });
      }

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: { parts: contents },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Tipo do exame identificado (ex: Hemograma, Glicemia)" },
              date: { type: Type.STRING, description: "Data do exame no formato YYYY-MM-DD" },
              notes: { type: Type.STRING, description: "Resumo das observações e resultados principais" },
            },
            required: ["type", "notes"],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      return NextResponse.json(result);

    } catch (geminiError: any) {
      console.error("Gemini Error:", geminiError);
      const is403 = geminiError?.message?.includes("403") || geminiError?.status === 403;
      return NextResponse.json({ 
        error: is403 
          ? "Erro 403: Acesso Negado ao Gemini. Verifique se a sua Chave de API no AI Studio está ativa e com faturamento/cotas liberadas." 
          : "Erro na análise com Gemini. Por favor, tente novamente ou use o modo manual." 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Ocorreu um erro inesperado na análise do exame." }, { status: 500 });
  }
}
