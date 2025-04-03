const { InferenceClient } = require("@huggingface/inference");

const dotenv = require("dotenv");
dotenv.config();

const client = new InferenceClient(process.env.HF_TOKEN);

async function generateEmbeddings(texts) {
	console.log("Starting...");
	const output = await client.featureExtraction({
		//model: "BAAI/bge-m3",
		model: "BAAI/bge-large-en-v1.5",
		inputs: texts,
		provider: "hf-inference",
	});
	return output;
}

async function main() {

	const embeddings = await generateEmbeddings([
		"This is a happy person!",
		"This is a very happy person!",
	]);

	const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
	console.log("Cosine similarity: ", similarity);
}

main();

function cosineSimilarity(vecA, vecB) {
	// Beräknar kosinuslikheten mellan två vektorer vecA och vecB

	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);

	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));

	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

	return dotProduct / (magnitudeA * magnitudeB);
}
