/*
This model exclusively caters to English texts, and any lengthy texts will be truncated to a maximum of 512 tokens.
*/

const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function generateEmbeddingWithGTE(text) {
    const embedding = await client.featureExtraction({
        model: "thenlper/gte-large",
        inputs: text,
    });
    console.log(`Our embedding is: ${embedding}`);
    console.log(`Our embedding length (dimension) is: ${embedding.length}`);
}

// Test with multilingual text
generateEmbeddingWithGTE("This is a great day! C'est une belle journée! Es ist ein schöner Tag!"); 