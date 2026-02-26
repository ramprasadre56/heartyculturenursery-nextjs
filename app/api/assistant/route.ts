import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

interface Plant {
    id: number;
    global_id?: number;
    scientific_name: string;
    common_name: string;
    category: string;
    image?: string;
    available_quantity?: number;
}

// Load plants once at module level
let plantsCache: Plant[] | null = null;
function loadPlants(): Plant[] {
    if (plantsCache) return plantsCache;
    const filePath = path.join(process.cwd(), 'public', 'data', 'plants.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    plantsCache = JSON.parse(raw);
    return plantsCache!;
}

// Search function that Gemini will call
function searchPlants(criteria: { query?: string; category?: string; limit?: number }): Plant[] {
    const plants = loadPlants();
    let results = plants;

    if (criteria.category) {
        const cat = criteria.category.toLowerCase();
        results = results.filter(p => p.category.toLowerCase().includes(cat));
    }

    if (criteria.query) {
        const q = criteria.query.toLowerCase();
        results = results.filter(p =>
            p.common_name.toLowerCase().includes(q) ||
            p.scientific_name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }

    return results.slice(0, criteria.limit || 12);
}

const searchPlantsTool: FunctionDeclaration = {
    name: 'search_plants',
    description: 'Search the nursery plant catalog by name, category, or keywords. Use this whenever the user asks about plants, varieties, or recommendations.',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            query: {
                type: SchemaType.STRING,
                description: 'Search keywords (plant name, type, or characteristic)',
            },
            category: {
                type: SchemaType.STRING,
                description: 'Plant category to filter by (e.g. "Fruit Plants", "Indoor Plants", "Aquatic Plants")',
            },
            limit: {
                type: SchemaType.NUMBER,
                description: 'Max results to return (default 12)',
            },
        },
    },
};

const SYSTEM_PROMPT = `You are the plant assistant for Hearty Culture Nursery (Govinda's Horticulture). You help customers find plants from our catalog of 880+ varieties.

Available categories in our catalog:
Aquatic Plants, Banana Plant Varieties, Calathea Varieties, Climbers & Creepers, Coconut Varieties, Commercial Timber Plants, Cordyline Varieties, Draceana Varieties, Flowering Shrubs, Fruit Varieties, Ginger Varieties, Heliconia Varieties, Herbal & Medicinal, Mango Varieties, Ornamental Musa Varieties, Palm Varieties, Philodendron Varieties, Pineapple Varieties, Plumeria Varieties, Sacred Trees, Tree Species, Water Lilies & Lotus.

Guidelines:
- Always use the search_plants tool to find plants when users ask about plants, varieties, or recommendations.
- When a user asks for something that doesn't match a category exactly (e.g. "indoor plants", "beginner plants"), translate it into relevant searches using actual categories. For indoor/beginner plants, search for Philodendron, Calathea, Draceana, Cordyline, and Palm varieties. For flowering plants, search Flowering Shrubs and Plumeria.
- You can call search_plants MULTIPLE times with different queries/categories to cover a broad request.
- Be friendly, knowledgeable about plants, and helpful.
- If the user asks about plant care, growing conditions, or general gardening advice, answer conversationally.
- When recommending plants, briefly mention why each plant is a good choice.
- Keep responses concise but informative.
- If no plants match, suggest alternative searches using the actual categories listed above.`;

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const { message, history } = await req.json();
        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ functionDeclarations: [searchPlantsTool] }],
        });

        // Build chat history
        const chatHistory = (history || []).map((msg: { role: string; text: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({ history: chatHistory });

        // Send the user message
        let result = await chat.sendMessage(message);
        let response = result.response;
        let products: Plant[] = [];

        // Handle function calls (may need multiple rounds)
        while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall)) {
            const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall);
            const functionResponses = [];

            for (const part of functionCalls) {
                const fc = part.functionCall!;
                if (fc.name === 'search_plants') {
                    const searchResults = searchPlants(fc.args as { query?: string; category?: string; limit?: number });
                    products = [...products, ...searchResults];
                    functionResponses.push({
                        functionResponse: {
                            name: fc.name,
                            response: { plants: searchResults, count: searchResults.length },
                        },
                    });
                }
            }

            result = await chat.sendMessage(functionResponses);
            response = result.response;
        }

        // Deduplicate products by global_id
        const seen = new Set<number>();
        products = products.filter(p => {
            const key = p.global_id ?? p.id;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const text = response.text();

        return NextResponse.json({ text, products });
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const errStack = error instanceof Error ? error.stack : '';
        console.error('Assistant API error:', errMsg, errStack);
        return NextResponse.json(
            { error: 'Failed to process request', details: errMsg },
            { status: 500 }
        );
    }
}
