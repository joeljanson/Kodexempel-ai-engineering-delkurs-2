const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function generateEmbeddingWithMiniLM(text) {
    const embedding = await client.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
    });
    console.log(`Our embedding is: ${embedding}`);
    console.log(`Our embedding length (dimension) is: ${embedding.length}`);
}

// Test with a simple English sentence
generateEmbeddingWithMiniLM("This is a test sentence for the MiniLM model."); 