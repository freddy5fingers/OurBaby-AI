import { GoogleGenAI } from "@google/genai";
import { PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash-image';

// Helper to strip the data:image/xyz;base64, prefix
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

// Helper to find the image part in the response
const extractImage = (response: any): string | null => {
  if (!response.candidates || response.candidates.length === 0) return null;
  
  const parts = response.candidates[0].content.parts;
  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Orchestrates the generation of the genetic analysis and 8 age/gender-progression images.
 * Uses a callback to stream results back to the UI as they finish.
 * 
 * UPDATED: Runs sequentially to avoid 429 Resource Exhausted errors.
 */
export const generateFutureBaby = async (
  parent1Base64: string,
  parent2Base64: string,
  onProgress: (partial: Partial<PredictionResult>) => void
): Promise<PredictionResult> => {
  
  const p1Data = cleanBase64(parent1Base64);
  const p2Data = cleanBase64(parent2Base64);

  const parentParts = [
    { inlineData: { mimeType: 'image/jpeg', data: p1Data } },
    { inlineData: { mimeType: 'image/jpeg', data: p2Data } },
  ];

  // Initialize empty result state
  const currentResult: PredictionResult = {
    analysis: '',
    infantBoy: null, infantGirl: null,
    toddlerBoy: null, toddlerGirl: null,
    childBoy: null, childGirl: null,
    teenBoy: null, teenGirl: null
  };

  // Helper to wait a bit between requests to be gentle on the rate limiter
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Text Analysis
  try {
    const analysisResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          ...parentParts,
          { text: "Analyze the facial features of these two parents. Provide a short, realistic genetic feature breakdown of what their biological child might inherit. Focus on nose, eyes, face shape, and hair. Keep it under 50 words. Be respectful and scientific." }
        ]
      }
    });
    
    const analysisText = analysisResponse.text || "Could not analyze traits.";
    currentResult.analysis = analysisText;
    onProgress({ analysis: analysisText });

  } catch (e) {
    console.error("Error generating analysis", e);
    onProgress({ analysis: "Analysis currently unavailable." });
  }

  // Common prompts for ages
  const prompts = {
    infant: "age 1 year, cute, happy, fully clothed, looking at camera. Soft, natural lighting.",
    toddler: "age 4 years, playing or smiling, fully clothed. Consistent skin tone/hair. Cinematic lighting.",
    child: "age 8 years, school portrait style, fully clothed. Preserve key identifying features.",
    teen: "age 18 years, high school senior portrait or casual lifestyle, fully clothed, fashionable, confident."
  };

  // Define the image generation tasks queue
  const imageTasks: { key: keyof PredictionResult; gender: 'boy' | 'girl'; agePrompt: string }[] = [
    { key: 'infantBoy', gender: 'boy', agePrompt: prompts.infant },
    { key: 'infantGirl', gender: 'girl', agePrompt: prompts.infant },
    { key: 'toddlerBoy', gender: 'boy', agePrompt: prompts.toddler },
    { key: 'toddlerGirl', gender: 'girl', agePrompt: prompts.toddler },
    { key: 'childBoy', gender: 'boy', agePrompt: prompts.child },
    { key: 'childGirl', gender: 'girl', agePrompt: prompts.child },
    { key: 'teenBoy', gender: 'boy', agePrompt: prompts.teen },
    { key: 'teenGirl', gender: 'girl', agePrompt: prompts.teen },
  ];

  // 2. Execute image tasks sequentially
  for (const task of imageTasks) {
    try {
      // Small delay before each request to help with rate limits
      await delay(500);

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            ...parentParts,
            { text: `Generate a photorealistic image of a biological ${task.gender} (${task.agePrompt}) resulting from these two parents. High quality, realistic.` }
          ]
        }
      });

      const imageUrl = extractImage(response);
      
      if (imageUrl) {
        currentResult[task.key] = imageUrl;
        onProgress({ [task.key]: imageUrl });
      }
      
    } catch (e) {
      console.error(`Error generating ${task.key}`, e);
      // We don't stop the whole process if one image fails, just log it.
    }
  }

  return currentResult;
};