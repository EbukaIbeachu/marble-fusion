import { BeadRecipe, MarbleStyle } from "../types";

export async function generateBeadRecipe(prompt: string): Promise<BeadRecipe | null> {
  try {
    const response = await fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) {
      console.error("Serverless function error:", response.statusText);
      return null;
    }
    const result = await response.json();
    if (result.error) {
      console.error("Gemini API error:", result.error);
      return null;
    }
    const data = result.result;
    // Map response to our internal types with IDs (adjust as needed based on actual response structure)
    return data;
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}