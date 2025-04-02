const dotenv = require("dotenv");
dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-exp-03-07" });

async function generateEmbeddingWithGemini(text) {
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    console.log(`Our embedding is: ${embedding}`);
    console.log(`Our embedding length (dimension) is: ${embedding.length}`);
}

// Test with English text
generateEmbeddingWithGemini("This is a test sentence for Google's latest Gemini embedding model."); 