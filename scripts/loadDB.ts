import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";

import fs from "fs/promises";
import path from "path";

// For web scraping
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const f1Data = [
  "https://duchinese.net/",
  "https://duchinese.net/lessons",
  "https://duchinese.net/grammar",
  "https://duchinese.net/pricing",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: { dimension: 1536, metric: similarityMetric },
  });

  console.log(res);

  return res;
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for await (const url of f1Data) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;
      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });

      console.log(res);
    }
  }
};

const scrapePage = async function (url: string): Promise<string> {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true },
    gotoOptions: { waitUntil: "domcontentloaded" },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });

  return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

// ...existing code...

const clearAllDatas = async () => {
  const collection: any = await db.collection(ASTRA_DB_COLLECTION);

  // Try deleteMany (preferred)
  try {
    if (typeof collection.deleteMany === "function") {
      const res = await collection.deleteMany({});
      console.log("deleteMany result:", res);
      return res;
    }
  } catch (err) {
    console.warn("deleteMany failed:", err);
  }

  // Try truncate
  try {
    if (typeof collection.truncate === "function") {
      const res = await collection.truncate();
      console.log("truncate result:", res);
      return res;
    }
  } catch (err) {
    console.warn("truncate failed:", err);
  }

  // Try drop collection
  try {
    if (typeof db.dropCollection === "function") {
      const res = await db.dropCollection(ASTRA_DB_COLLECTION);
      console.log("dropCollection result:", res);
      return res;
    }
  } catch (err) {
    console.warn("dropCollection failed:", err);
  }

  throw new Error(
    "Could not clear data: no supported deletion method found on the Astra DB client."
  );
};

const insertDatasetToDB = async (filePath?: string) => {
  const file = filePath ?? path.resolve(__dirname, "../data/dataset.jsonl");
  const collection: any = await db.collection(ASTRA_DB_COLLECTION);

  const raw = await fs.readFile(file, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  console.log(`Found ${lines.length} lines in ${file}`);

  for (const [i, line] of lines.entries()) {
    try {
      const parsed = JSON.parse(line);
      const instruction = parsed.instruction ?? "";
      const response = parsed.response ?? "";
      const text = `${instruction}\n\n${response}`.trim();

      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        instruction,
        response,
        text,
        $vector: vector,
        meta: { source: path.basename(file), index: i },
      });

      if (i % 50 === 0) console.log(`Inserted ${i + 1}/${lines.length}`);
    } catch (err) {
      console.warn(`Skipping line ${i} due to error:`, err);
    }
  }

  console.log("Dataset insert complete.");
};

// createCollection().then(() => loadSampleData());

// clearAllDatas().then(() => console.log("Cleared all data."));

// insertDatasetToDB().then(() => console.log("Inserted dataset to DB."));
