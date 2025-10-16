import { GoogleGenAI, Chat } from "@google/genai";
import type { UserPreferences, GroundingSource, GeminiResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const jsonSchemaString = JSON.stringify({
    "type": "object",
    "properties": {
        "summary": { "type": "string", "description": "A 2-3 sentence summary of the findings, written in a helpful and conversational tone." },
        "products": {
            "type": "array",
            "description": "A list of found products, properties, or services. Return up to 6 items. If nothing relevant is found, return an empty array.",
            "items": {
                "type": "object",
                "properties": {
                    "name": { "type": "string", "description": "The full name of the product or service." },
                    "description": { "type": "string", "description": "A concise and compelling description (around 15-20 words)." },
                    "price": { "type": "string", "description": "Formatted price with currency symbol based on user's preference, e.g., '$99.99', '€85.00'." },
                    "platform": { "type": "string", "description": "The name of the website or platform where this was found." },
                    "imageUrl": { "type": "string", "description": "A direct, publicly accessible URL to a high-quality representative image." },
                    "productUrl": { "type": "string", "description": "A direct URL to the product/service page." }
                },
                "required": ["name", "description", "price", "platform", "imageUrl", "productUrl"]
            }
        },
        "sources": {
            "type": "array",
            "description": "A list of e-commerce or marketplace platforms relevant to the search. Return up to 3 sources.",
            "items": {
                "type": "object",
                "properties": {
                    "platform": { "type": "string", "description": "Name of the platform." },
                    "url": { "type": "string", "description": "Homepage URL of the platform." },
                    "region": { "type": "string", "description": "Primary region served, e.g., 'Global', 'USA', 'Europe'." },
                    "specialties": { "type": "array", "items": { "type": "string" }, "description": "List of key specialties, e.g., ['Electronics', 'Handmade Goods', 'Fashion']" }
                },
                "required": ["platform", "url", "region", "specialties"]
            }
        }
    },
    "required": ["summary", "products", "sources"]
}, null, 2);


// Initialize a persistent chat session
const chat: Chat = ai.chats.create({
  model: "gemini-2.5-flash",
  config: {
    systemInstruction: `You are Marketplace AI, a universal research assistant. Your goal is to find anything that can be bought on the internet based on the user's query.
You MUST use the Google Search tool to find the most up-to-date information.
Your final output MUST be a single, valid JSON object that adheres to the following structure.
Do not include any text, markdown, or code block formatting (like \`\`\`json) before or after the JSON object. Just the raw JSON.

JSON Structure:
${jsonSchemaString}`,
    tools: [{ googleSearch: {} }],
  },
});


// Helper to extract JSON from a string that might contain other text
const extractJson = (text: string): string => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};


/**
 * Sends a message to the Gemini chat and streams the response.
 * @param query The user's message.
 * @param preferences User's settings for personalization.
 * @returns An async generator that yields the accumulating response text and grounding sources.
 */
export async function* sendMessageAndStreamResponse(
  query: string,
  preferences: UserPreferences
): AsyncGenerator<{ text: string, sources: GroundingSource[] }> {
  const prompt = `
User Query: "${query}"

User Preferences:
- Language: ${preferences.language}
- Region: ${preferences.region}
- Currency: ${preferences.currency}
`;

  try {
    const stream = await chat.sendMessageStream({ message: prompt });
    let accumulatedText = "";

    for await (const chunk of stream) {
      accumulatedText += chunk.text;
      
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingSources: GroundingSource[] = groundingChunks
          .map((c: any) => (c.web ? { uri: c.web.uri, title: c.web.title } : null))
          .filter((source: any): source is GroundingSource => source?.uri && source?.title);

      yield { text: accumulatedText, sources: groundingSources };
    }
    
    // Final yield with the fully parsed and cleaned JSON.
    const finalJson = extractJson(accumulatedText);
    JSON.parse(finalJson); // Validate that the final text is valid JSON
    yield { text: finalJson, sources: [] }; // Final sources are already sent, so empty array here

  } catch (error) {
    console.error("Error in sendMessageAndStreamResponse:", error);
    let message = 'An unexpected error occurred while communicating with the AI assistant.';
    if (error instanceof Error) {
        // More specific error for JSON parsing issues
        if(error.message.includes('JSON')) {
            message = "The AI assistant returned a response in an invalid format. Please try rephrasing your query.";
        } else {
            message = error.message;
        }
    }
    throw new Error(message);
  }
}