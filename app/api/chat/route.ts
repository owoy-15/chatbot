// import OpenAI from "openai";

// import { openai } from "@ai-sdk/openai";
// import { streamText } from "ai";

import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from "ai";
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

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const latestMessage = messages[messages.length - 1]?.content;

    let docContext = "";

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();

      const docsMap = documents?.map((doc) => doc.text);

      docContext = JSON.stringify(docsMap);
    } catch (error) {
      console.log("Error querying database:", error);
      docContext = "";
      throw error;
    }

    const template: CoreMessage = {
      role: "system",
      content: `You are an AI assistant who knows everything about Xue App.
      Use the following context to help answer questions:
      ----------------
      START CONTEXT
      ${docContext}
      END CONTEXT
      ----------------
      QUESTION: ${latestMessage}
      ----------------`,
    };

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [template, ...messages],
    //   stream: true,
    // });

    const response = await streamText({
      model: openaiProvider("gpt-4o"),
      messages: [template, ...messages],
    });

    // const stream = OpenAIStream(response);

    // return new StreamingTextResponse(stream);

    //
    // toUIMessageStreamResponse() is NOT for useChat()
    return response.toUIMessageStreamResponse();
  } catch (error) {
    console.log("Error querying database:", error);
    throw error;
  }
}
