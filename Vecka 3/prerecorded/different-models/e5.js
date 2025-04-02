const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function generateEmbeddingsWithBGE(texts) {
	console.log("Generating embedding with E5...");
	const embeddings = await client.featureExtraction({
		model: "intfloat/multilingual-e5-large",
		inputs: texts,
	});
	//console.log(embeddings);
	console.log("Embedding generated successfully. Embedding length: ", embeddings[0].length);
	//console.log(embeddings.length);

	const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
	console.log("Similarity: ", similarity);

	return embeddings;
}

generateEmbeddingsWithBGE(["passage: Today is a beautiful day", "query: What kind of day is it?"])
//generateEmbeddingsWithBGE(["Idag är en vacker dag", "Jag gillar inte pizza"]);

function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}
