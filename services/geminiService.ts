import { GoogleGenAI, Type } from "@google/genai";
import type { ApiResponse, GeminiTextResponse, Product } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. Some features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const ecommerceKnowledge = {
    global_platforms: [
        "Amazon (Global)", "eBay (Global)", "AliExpress (Global, from China)", "Etsy (Handmade & Vintage)", "Wish (Budget items)", "Rakuten (Global/Japan)"
    ],
    regional_platforms: {
        "Americas": [
            "Mercado Libre (Latin America)", "Walmart (USA, Canada, Mexico)", "Target (USA)", "Best Buy (USA, Canada)", "Canadian Tire (Canada)", "Magazine Luiza (Brazil)", "Americanas (Brazil)", "Coppel (Mexico)", "Falabella (Chile, Peru, Colombia)"
        ],
        "Europe": [
            "Zalando (Fashion)", "Otto (Germany)", "Bol.com (Netherlands, Belgium)", "Cdiscount (France)", "ASOS (UK, Fashion)", "Allegro (Poland)", "Wildberries (Russia & Eastern Europe)", "Ozon (Russia)", "El Corte Inglés (Spain)"
        ],
        "Asia_Pacific": [
            "Alibaba (B2B, China)", "Taobao (China)", "Tmall (China)", "JD.com (China)", "Pinduoduo (China)", "Flipkart (India)", "Myntra (India, Fashion)", "Coupang (South Korea)", "Gmarket (South Korea)", "Yahoo! Shopping (Japan)", "Lazada (Southeast Asia)", "Shopee (Southeast Asia)", "Tokopedia (Indonesia)", "Tiki (Vietnam)", "Kogan (Australia)"
        ],
        "Middle_East_Africa": [
            "Noon (Middle East)", "Jumia (Africa-wide)", "Takealot (South Africa)", "Trendyol (Turkey)", "Hepsiburada (Turkey)"
        ]
    },
    specialized_platforms: {
        "Fashion_Apparel": ["Shein", "H&M", "Zara", "Farfetch (Luxury)", "Net-a-Porter (Luxury)", "Revolve"],
        "Electronics_PC_Hardware": ["Newegg (PC Parts)", "B&H Photo Video (Photo/Video Gear)", "Micro Center (USA, PC Parts)", "Currys (UK)", "MediaMarkt (Europe)"],
        "Home_Goods_Furniture": ["Wayfair", "IKEA", "Home Depot (DIY/Hardware)", "Lowe's (DIY/Hardware)", "Crate & Barrel"],
        "Sustainable_Ethical": ["Patagonia (Outdoor)", "Made Trade", "EarthHero", "Thrive Market (Groceries)"],
        "Hobbies_Crafts": ["Michaels (Crafts)", "JOANN (Crafts)", "Thomann (Music Gear, Europe)", "Sweetwater (Music Gear, USA)"],
        "Beauty_Skincare": ["Sephora", "Ulta Beauty", "Cult Beauty (UK)", "YesStyle (Asian Beauty)"]
    }
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        text_response: { 
            type: Type.STRING,
            description: "A detailed, helpful response to the user's query."
        },
        ecommerce_sources: {
            type: Type.ARRAY,
            description: "A list of relevant e-commerce platforms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, description: "Name of the e-commerce platform." },
                    region: { type: Type.STRING, description: "Primary region or country of operation." },
                    specialties: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Categories the platform is known for." },
                    url: { type: Type.STRING, description: "The main URL of the platform." }
                },
                required: ['platform', 'region', 'specialties', 'url']
            }
        },
        products: {
            type: Type.ARRAY,
            description: "A list of specific product recommendations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the product." },
                    description: { type: Type.STRING, description: "A brief description of the product." },
                    price: { type: Type.NUMBER, description: "An estimated price in USD." },
                    platform: { type: Type.STRING, description: "A suggested platform to find this product." },
                    image_prompt: { type: Type.STRING, description: "A detailed, photorealistic prompt for an image generation model. E.g., 'A sleek silver laptop on a wooden desk, studio lighting'." }
                },
                required: ['name', 'description', 'price', 'platform', 'image_prompt']
            }
        }
    },
    required: ['text_response', 'ecommerce_sources', 'products']
};

interface ImageResult {
    url: string;
    error?: string;
}

async function generateProductImage(imagePrompt: string): Promise<ImageResult> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return { url: `data:image/jpeg;base64,${base64ImageBytes}` };
        }
        throw new Error("No image was generated by the API.");
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error(`Error generating image for prompt "${imagePrompt}":`, errorMessage);
        return { 
            url: `https://placehold.co/400x300?text=Image+Failed`,
            error: errorMessage
        };
    }
}

export async function generateMarketplaceResponse(userInput: string): Promise<ApiResponse> {
    const knowledgeForPrompt = `
- **Global Platforms:** ${ecommerceKnowledge.global_platforms.join(', ')}
- **Regional Specialists:**
  - Americas: ${ecommerceKnowledge.regional_platforms.Americas.join(', ')}
  - Europe: ${ecommerceKnowledge.regional_platforms.Europe.join(', ')}
  - Asia Pacific: ${ecommerceKnowledge.regional_platforms.Asia_Pacific.join(', ')}
  - Middle East & Africa: ${ecommerceKnowledge.regional_platforms.Middle_East_Africa.join(', ')}
- **Specialized Retailers:**
  - Fashion & Apparel: ${ecommerceKnowledge.specialized_platforms.Fashion_Apparel.join(', ')}
  - Electronics & PC Hardware: ${ecommerceKnowledge.specialized_platforms.Electronics_PC_Hardware.join(', ')}
  - Home Goods & Furniture: ${ecommerceKnowledge.specialized_platforms.Home_Goods_Furniture.join(', ')}
  - Sustainable & Ethical: ${ecommerceKnowledge.specialized_platforms.Sustainable_Ethical.join(', ')}
  - Hobbies & Crafts: ${ecommerceKnowledge.specialized_platforms.Hobbies_Crafts.join(', ')}
  - Beauty & Skincare: ${ecommerceKnowledge.specialized_platforms.Beauty_Skincare.join(', ')}
`;

    const prompt = `
        You are Marketplace AI, an intelligent shopping research assistant. Your job is to help users find and buy any product from any online store worldwide using your extensive knowledge base.

        **Your core instructions:**
        1.  **Analyze the user's request:** Identify the product or category. Pay close attention to any specified preferences like brand, price, **shipping destination (e.g., "shipped to Nigeria")**, origin, eco-friendliness, etc.
        2.  **Provide comprehensive, location-aware results:** Search your knowledge base to present the best matching products and platforms. **If a shipping destination is mentioned, prioritize platforms that serve that region.**
        3.  **Mention Currency:** When relevant, especially for regional platforms, mention the typical currency they operate in (e.g., JPY for a Japanese site, BRL for a Brazilian site) in your main text response. Your price estimate in the 'products' array should remain in USD for consistency.
        4.  **Be helpful and clear:** If the user's query is vague, suggest what details they could add to improve the results (e.g., "To give you better recommendations, could you tell me your budget or preferred brands?"). However, still provide a general response based on the initial query.
        
        **Your extensive knowledge base includes:**
        ${knowledgeForPrompt}

        **User's request:** "${userInput}"

        **Your task:**
        Based on the user's request, provide a helpful response. Include a list of relevant e-commerce platforms and specific product recommendations. For each product, create a detailed prompt to generate a high-quality, photorealistic image.

        **Output Format:**
        Provide your response strictly in the specified JSON format.
    `;

    const textResponseResult = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const rawResponse = JSON.parse(textResponseResult.text) as GeminiTextResponse;

    const productsWithImages: Product[] = [];
    const imageGenerationErrors: string[] = [];

    for (const product of rawResponse.products) {
        const imageResult = await generateProductImage(product.image_prompt);
        
        if (imageResult.error) {
            imageGenerationErrors.push(`Could not generate image for "${product.name}". The API reported an error.`);
        }

        const { image_prompt, ...restOfProduct } = product;
        productsWithImages.push({ ...restOfProduct, imageUrl: imageResult.url });

        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return {
        textResponse: rawResponse.text_response,
        ecommerceSources: rawResponse.ecommerce_sources,
        products: productsWithImages,
        imageGenerationErrors: imageGenerationErrors.length > 0 ? imageGenerationErrors : undefined,
    };
}