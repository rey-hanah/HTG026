import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParkingSpot, GeminiRecommendation } from "@/types/parking";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function rankParking(
  destination: string, 
  spots: ParkingSpot[],
  arrivalMinutes?: number | null
): Promise<GeminiRecommendation | null> {
  const now = new Date();
  const arrivalTime = arrivalMinutes 
    ? new Date(now.getTime() + arrivalMinutes * 60000)
    : now;
  
  const arrivalContext = arrivalMinutes
    ? `User will arrive in approximately ${arrivalMinutes} minutes (around ${arrivalTime.toLocaleTimeString()}).`
    : `User is arriving now.`;
  
  const prompt = `
You are a parking assistant in Vancouver, Canada. Use your knowledge of typical parking patterns.
User wants to park near: "${destination}"
Current time: ${now.toLocaleTimeString()} on ${now.toLocaleDateString('en-CA', { weekday: 'long' })}
${arrivalContext}

Consider:
- Time of day affects availability (lunch rush 11:30-1:30, dinner 5:30-8pm, morning commute 7-9am)
- Downtown Vancouver gets busy during business hours
- Street meters often have time limits
- Weekend vs weekday patterns differ

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
  "reason": "one sentence why this is best for the user ${arrivalMinutes ? `arriving in ${arrivalMinutes} minutes` : 'right now'}",
  "availability_estimate": "likely available | might be busy | probably full",
  "tip": "optional short timing tip"
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
