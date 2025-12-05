import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CompanyProfile, GeneratedContent } from "../types";

// Schema for structured output
const socialPostSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    twitter: { type: Type.STRING, description: "A short, engaging tweet (under 280 chars) with hashtags." },
    linkedin: { type: Type.STRING, description: "A professional, insightful post suitable for LinkedIn." },
    instagram: { type: Type.STRING, description: "A visual-heavy caption with emojis and a block of hashtags." },
    facebook: { type: Type.STRING, description: "A conversational and community-focused post." },
  },
  required: ["twitter", "linkedin", "instagram", "facebook"],
};

export const generateSocialPosts = async (
  topic: string,
  company: CompanyProfile,
  modelName: string = "gemini-2.5-flash"
): Promise<GeneratedContent | null> => {
  try {
    // Initialize inside function to avoid startup crashes if environment variables are missing
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Actúa como un experto Community Manager para la empresa "${company.name}".
      
      Detalles de la empresa:
      - Industria: ${company.industry}
      - Tono de voz: ${company.tone}
      - Descripción: ${company.description}
      
      Tarea: Genera variaciones de posts para redes sociales sobre el siguiente tema: "${topic}".
      
      Requisitos:
      1. Adapta el contenido a la audiencia y formato de cada red social.
      2. Mantén el tono de marca definido.
      3. Incluye hashtags relevantes.
      4. Devuelve SOLAMENTE el objeto JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: socialPostSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Error generating posts:", error);
    throw error;
  }
};

export const analyzePostImpact = async (content: string, platform: string): Promise<{ score: number; suggestion: string }> => {
    // A simplified helper to "analyze" a post before publishing
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analiza el siguiente post de ${platform} y dame una puntuación del 1 al 100 de impacto potencial y una sugerencia de mejora breve.\n\nPost: "${content}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        suggestion: { type: Type.STRING }
                    }
                }
            }
        });
        const text = response.text;
        return text ? JSON.parse(text) : { score: 0, suggestion: "Error analyzing" };
    } catch (e) {
        return { score: 50, suggestion: "No se pudo conectar con la IA." };
    }
}