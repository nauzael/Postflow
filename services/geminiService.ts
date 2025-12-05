import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CompanyProfile, GeneratedContent, Platform } from "../types";

// Helper to construct dynamic schema based on selected platforms
const createDynamicSchema = (platforms: Platform[]): Schema => {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  platforms.forEach(p => {
    const key = p.toLowerCase();
    properties[key] = { type: Type.STRING, description: `Content optimized for ${p}` };
    required.push(key);
  });

  return {
    type: Type.OBJECT,
    properties,
    required,
  };
};

export const generateSocialPosts = async (
  topic: string,
  company: CompanyProfile,
  platforms: Platform[],
  modelName: string = "gemini-2.5-flash"
): Promise<GeneratedContent | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Rules per platform
    const rules = {
      [Platform.Twitter]: "Max 280 chars, concise, heavy use of abbreviations if needed, 2-3 hashtags.",
      [Platform.LinkedIn]: "Professional tone, structured formatting (bullet points), focus on industry value, 3-5 hashtags.",
      [Platform.Instagram]: "Visual-first caption, engaging hook, line breaks for readability, block of 10-15 hashtags at the bottom.",
      [Platform.Facebook]: "Conversational, community-focused, encourages sharing/comments, moderate length."
    };

    const selectedRules = platforms.map(p => `- ${p}: ${rules[p]}`).join("\n");

    const prompt = `
      Actúa como un experto Community Manager para la empresa "${company.name}".
      
      Detalles de la empresa:
      - Industria: ${company.industry}
      - Tono: ${company.tone}
      - Descripción: ${company.description}
      
      Tarea: Genera posts para las siguientes redes sociales sobre el tema: "${topic}".
      
      Reglas Específicas por Red Social:
      ${selectedRules}
      
      Requisitos Globales:
      1. Mantén el tono de marca "${company.tone}".
      2. Usa emojis apropiados.
      3. Devuelve SOLAMENTE el objeto JSON con las claves correspondientes a las redes solicitadas (${platforms.map(p => p.toLowerCase()).join(', ')}).
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: createDynamicSchema(platforms),
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

export const generateAIImage = async (prompt: string, style: string = 'photorealistic'): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const imagePrompt = `Create a high quality, professional social media image about: ${prompt}. Style: ${style}. Aspect ratio 1:1.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        // Handle Imagen response structure
        const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
        
        if (base64Image) {
            return `data:image/jpeg;base64,${base64Image}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const analyzePostImpact = async (content: string, platform: string): Promise<{ score: number; suggestion: string }> => {
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