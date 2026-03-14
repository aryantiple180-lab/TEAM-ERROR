import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

export async function findNearbyHospitals(lat: number, lng: number): Promise<any[]> {
  const genAI = getGemini();
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Find nearby hospitals and pharmacies. Provide their names, addresses, and ratings.',
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    }
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!chunks) return [];

  const places: any[] = [];
  chunks.forEach((chunk: any) => {
    if (chunk.maps?.uri) {
      places.push({
        name: chunk.maps.title || 'Hospital/Pharmacy',
        uri: chunk.maps.uri,
        address: chunk.maps.placeAnswerSources?.reviewSnippets?.[0] || 'Address not available'
      });
    }
  });

  return places;
}
