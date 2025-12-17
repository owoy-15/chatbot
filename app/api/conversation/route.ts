// File: /app/api/conversation/route.ts
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { streamText, CoreMessage } from "ai";
import { openai as openaiProvider } from "@ai-sdk/openai";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE });

export async function GET() {
  return new Response(JSON.stringify({ message: "Use POST with { prompt }" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
      });
    }

    // 1️⃣ Generate embedding for semantic search
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
      encoding_format: "float",
    });

    let docContext = "";

    // 2️⃣ Query Astra DB for related documents
    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: { $vector: embedding.data[0].embedding },
        limit: 10,
      });

      const documents = await cursor.toArray();
      const docsMap = documents?.map((doc) => doc.text);
      docContext = JSON.stringify(docsMap);
    } catch (error) {
      console.error("Error querying database:", error);
      docContext = "";
    }

    // 3️⃣ Prepare system message template
    const systemMessage: CoreMessage = {
      role: "system",
      content: `You are an AI assistant who knows everything about Formula One.
Use the following context to help answer questions:
----------------
START CONTEXT
${docContext}
END CONTEXT
----------------`,
    };

    const userMessage: CoreMessage = {
      role: "user",
      content: prompt,
    };

    // 4️⃣ Call AI streaming API
    const response = await streamText({
      model: openaiProvider("gpt-4o"),
      messages: [systemMessage, userMessage],
    });

    // 5️⃣ Return a stream response compatible with UI
    return response.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message || error }), {
      status: 500,
    });
  }
}
