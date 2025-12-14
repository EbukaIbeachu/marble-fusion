import { GoogleGenAI, Type } from "@google/genai";
import { BeadRecipe, ColorDef, MarbleStyle } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert high-fashion jewelry designer and colorist. 
Your goal is to create sophisticated marble bead recipes based on abstract descriptions, moods, or natural phenomena.
A recipe consists of a palette of colors with specific visual weights (percentages) and physical parameters for the fusion simulation.

Fusion Parameters Guidance:
- Style: 
    - 'classic': Standard balanced marble veins.
    - 'nebula': Soft, cloudy, dreamlike, diffused.
    - 'agate': High-frequency banding, layered stone.
    - 'fracture': Sharp, jagged, crystalline edges.
- Turbulence (0-100): High = chaotic mix, Low = smooth flow.
- Distortion (0-100): High = swirl/whirlpool, Low = straight/wavy lines.
- Scale (0-100): High = dense detailed pattern, Low = broad large strokes.
- Roughness (0-100): High = gritty/stone-like texture, Low = polished/glass-like.
`;

export async function generateBeadRecipe(prompt: string): Promise<BeadRecipe | null> {
  // Debug: Log the API key to verify it is available in the deployed environment
  console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY not found in environment");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a unique marble bead design based on this concept: "${prompt}".`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A creative, elegant name for this bead design" },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING, description: "Hex color code e.g. #FF0000" },
                  weight: { type: Type.NUMBER, description: "Visual dominance percentage 10-100" }
                },
                required: ["hex", "weight"]
              }
            },
            params: {
              type: Type.OBJECT,
              properties: {
                turbulence: { type: Type.NUMBER },
                scale: { type: Type.NUMBER },
                distortion: { type: Type.NUMBER },
                roughness: { type: Type.NUMBER },
                style: { type: Type.STRING, enum: ['classic', 'nebula', 'agate', 'fracture'] }
              },
              required: ["turbulence", "scale", "distortion", "roughness", "style"]
            }
          },
          required: ["name", "colors", "params"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    
    // Map response to our internal types with IDs
    return {
      name: data.name,
      colors: data.colors.map((c: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        hex: c.hex,
        weight: c.weight
      })),
      params: {
        turbulence: data.params.turbulence,
        scale: data.params.scale,
        distortion: data.params.distortion,
        roughness: data.params.roughness,
        style: data.params.style as MarbleStyle,
        seed: Math.random() * 1000
      }
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}