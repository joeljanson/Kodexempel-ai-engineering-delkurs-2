const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function generateEmbeddingWithMixedBread(text) {
	const embedding = await client.featureExtraction({
		model: "mixedbread-ai/mxbai-embed-large-v1",
		inputs: text,
	});
	console.log(`Our embedding is: ${embedding}`);
	console.log(`Our embedding length (dimension) is: ${embedding.length}`);
}

generateEmbeddingWithMixedBread("This is a great day!");
