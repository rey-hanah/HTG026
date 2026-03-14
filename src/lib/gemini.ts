import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParkingSpot, GeminiRecommendation } from "@/types/parking";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function rankParking(
  destination: string, 
  spots: ParkingSpot[]
): Promise<GeminiRecommendation | null> {
  const now = new Date();
  
  const prompt = `
You are a parking assistant in Vancouver, Canada.
User wants to park near: "${destination}"
Current time: ${now.toLocaleTimeString()} on ${now.toLocaleDateString('en-CA', { weekday: 'long' })}

Parking options:
${JSON.stringify(spots.slice(0, 5).map(s => ({
  name: s.name,
  type: s.type,
  rate: s.rate,
  timeLimit: s.timeLimit,
  walkTime: s.walkTime,
})), null, 2)}

Return ONLY valid JSON, no markdown:
{
  "best_index": 0,
  "reason": "one sentence why this is best for the user right now",
  "availability_estimate": "likely available | might be busy | probably full",
  "tip": "optional short tip"
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini error:", e);
    return null;
  }
}
