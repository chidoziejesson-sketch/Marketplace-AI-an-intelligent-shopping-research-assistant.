import { GoogleGenAI, Chat } from "@google/genai";
import type { UserPreferences, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A persistent chat session
let chat: Chat | null = null;

/**
 * Builds the system instruction and initializes a new chat session.
 * @param preferences User's settings for language, region, and currency.
 */
function initializeChat(preferences: UserPreferences) {
  const systemInstruction = `You are an expert AI assistant for a marketplace search engine. Your goal is to find products, services, or properties that match the user's query.

User Preferences are:
- Language: ${preferences.language}
- Region: ${preferences.region}
- Currency: ${preferences.currency} (Default to this unless a location in the query suggests otherwise, e.g., 'in the UK' should use GBP).

You will always respond with a single JSON object. Do not include any text outside of the JSON. Your response MUST start with '{' and end with '}'.

The JSON object must follow this structure:
{
  "summary": "A concise, helpful summary of the findings, written in a conversational tone.",
  "products": [
    {
      "name": "Product/Service/Property Name",
      "description": "A brief, compelling description.",
      "price": "Price formatted as a string with currency symbol.",
      "platform": "The name of the website or platform.",
      "imageUrl": "A direct URL to a relevant, high-quality image from the seller's website.",
      "productUrl": "A direct URL to the product/listing page."
    }
  ],
  "sources": [
    {
      "platform": "Name of the e-commerce platform or marketplace.",
      "url": "URL to the platform's homepage.",
      "region": "The primary region the platform serves.",
      "specialties": ["Keywords describing what the platform is best for."]
    }
  ]
}`;

  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });
}

/**
 * Sends a message to the persistent chat session and streams the response.
 * @param message The user's message.
 * @param preferences User's settings for language, region, and currency.
 * @returns An async generator that yields the accumulating text and grounding sources.
 */
export async function* sendMessageAndStreamResponse(
  message: string,
  preferences: UserPreferences
): AsyncGenerator<{ text: string; sources: GroundingSource[] }> {
  // Initialize the chat on the first message or if preferences change.
  // A more robust implementation might check if preferences have actually changed.
  if (!chat) {
    initializeChat(preferences);
  }

  try {
    if (!chat) {
        throw new Error("Chat session not initialized.");
    }
    
    const stream = await chat.sendMessageStream({ message });

    let accumulatedText = '';
    let allSources: GroundingSource[] = [];
    const seenUris = new Set<string>();

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        accumulatedText += chunkText;
      }
      
      const groundingMeta = chunk.candidates?.[0]?.groundingMetadata;
      if (groundingMeta?.groundingChunks) {
        const newSources: GroundingSource[] = groundingMeta.groundingChunks
          .map((c: any) => ({
            uri: c.web?.uri || '',
            title: c.web?.title || '',
          }))
          .filter((s: GroundingSource) => s.uri && s.title && !seenUris.has(s.uri));
        
        if (newSources.length > 0) {
            newSources.forEach(s => seenUris.add(s.uri));
            allSources.push(...newSources);
        }
      }

      yield { text: accumulatedText, sources: allSources };
    }
  } catch (error) {
    console.error('Error streaming from Gemini Chat:', error);
    // Reset chat on error
    chat = null;
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred with the Gemini API.');
  }
}