import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParkingSpot, GeminiRecommendation } from "@/types/parking";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface ParkingDensity {
  totalSpots: number;
  freeSpots: number;
  paidSpots: number;
  evSpots: number;
}

export async function rankParking(
  destination: string,
  spots: ParkingSpot[],
  driveTimeMinutes?: number | null,
  parkingDensity?: ParkingDensity | null,
  arrivalOffsetMinutes?: number | null
): Promise<GeminiRecommendation | null> {
  const now = new Date();

  // Calculate effective arrival time: user-chosen offset OR drive time OR now
  const offsetMins = arrivalOffsetMinutes ?? driveTimeMinutes ?? 0;
  const effectiveArrival = new Date(now.getTime() + offsetMins * 60000);

  const arrivalContext =
    driveTimeMinutes
      ? `User is currently ~${driveTimeMinutes} min away by car (arriving ~${effectiveArrival.toLocaleTimeString()}).`
      : arrivalOffsetMinutes
      ? `User plans to arrive in ${arrivalOffsetMinutes} min (~${effectiveArrival.toLocaleTimeString()}).`
      : `User is at the destination now.`;

  const densityContext = parkingDensity
    ? `Parking availability near destination: ${parkingDensity.totalSpots} total spots (${parkingDensity.freeSpots} free, ${parkingDensity.paidSpots} paid, ${parkingDensity.evSpots} EV).`
    : "";

  const prompt = `
You are a parking assistant in Vancouver, Canada. Use your knowledge of typical parking patterns.
User wants to park near: "${destination}"
Current time: ${now.toLocaleTimeString()} on ${now.toLocaleDateString('en-CA', { weekday: 'long' })}
${arrivalContext}
${densityContext}

Consider:
- Time of day affects availability (lunch rush 11:30-1:30, dinner 5:30-8pm, morning commute 7-9am)
- Downtown Vancouver gets busy during business hours
- Street meters often have time limits
- Weekend vs weekday patterns differ
- Fewer total spots means higher demand - factor that into availability
- Consider how long user will need to park vs time limits

Parking options:
${JSON.stringify(spots.slice(0, 5).map(s => ({
  name: s.name,
  type: s.type,
  rate: s.rate,
  timeLimit: s.timeLimit,
  walkTime: s.walkTime,
  distance: s.walkDistance ? `${Math.round(s.walkDistance)}m` : "unknown",
})), null, 2)}

Return ONLY valid JSON, no markdown:
{
  "best_index": 0,
  "reason": "one sentence why this is best considering travel time, parking density, and time of day",
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
