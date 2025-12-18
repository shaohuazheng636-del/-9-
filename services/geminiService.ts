import { GoogleGenAI, Type } from "@google/genai";
import { SceneAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImagesForScene = async (files: File[]): Promise<SceneAnalysis> => {
  if (files.length === 0) throw new Error("No files provided");

  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = `
    Analyze the uploaded reference image(s). 
    Extract a detailed visual description of the subject (character or object), their clothing/appearance, the environment/background, lighting conditions, and the overall artistic style (e.g., cinematic, cyberpunk, oil painting).
    
    The description should be optimized for an AI image generator prompt.
    
    Return the result as a JSON object with two fields:
    - "en": The description in English.
    - "cn": The description in Chinese (Simplified).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                en: { type: Type.STRING },
                cn: { type: Type.STRING }
            },
            required: ['en', 'cn']
        }
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini");

    const analysis = JSON.parse(resultText) as SceneAnalysis;
    return analysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};