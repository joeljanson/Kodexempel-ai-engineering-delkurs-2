const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function generateEmbedding(text) {
	const embedding = await client.featureExtraction({
		model: "BAAI/bge-large-en-v1.5",
		inputs: text,
		provider: "hf-inference",
	});
	return embedding;
}

async function findMostRelevantPiece(query) {
	const queryEmbedding = await generateEmbedding(query);

	const pieces = JSON.parse(fs.readFileSync("classical-embeddings.json", "utf8")).pieces;

	const similarities = pieces.map((piece) => {
		const similarity = cosineSimilarity(queryEmbedding, piece.embedding);
		return {
			piece,
			similarity,
		};
	});

    //console.log(similarities.sort((a, b) => b.similarity - a.similarity));

	const mostRelevantPiece = similarities.sort((a, b) => b.similarity - a.similarity)[0].piece;

	console.log("Most relevant piece:", mostRelevantPiece.title);
	console.log("Description:", mostRelevantPiece.description);
	console.log("Duration:", mostRelevantPiece.duration);
	console.log("Similarity:", similarities[0].similarity);
	return mostRelevantPiece;
}

function cosineSimilarity(vecA, vecB) {
	// Beräknar kosinuslikheten mellan två vektorer vecA och vecB

	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);

	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));

	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

	return dotProduct / (magnitudeA * magnitudeB);
}

async function getAnswerFromMistral(context, query) {
	const systemPrompt = `You are a knowledgeable classical music expert. 
    Use the provided context about a classical music piece to suggest a piece to listen to.
    You will be given a context about a classical music piece and a query.
    NEVER acknowledge that the user has provided any context, this is fetched from a database and added to YOUR knowledge.
    And try to answer the query based on the context, never suggest a piece that is not mentioned in the context.
    If the context doesn't contain enough information to fully answer the question, say so. 
    Keep your response concise but engaging and focused on the specific piece mentioned in the context.`;

	const userPrompt = `Context (NOT TO BE MENTIONED TO THE USER): ${context.description}, ${context.title}, ${context.duration}\n\nQuery: ${query}`;

    console.log(userPrompt);

	const response = await client.chatCompletion({
		model: "mistralai/Mistral-7B-Instruct-v0.3",
		messages: [
			{
				role: "user",
				content: systemPrompt + "\n\n" + userPrompt,
			},
		],
		provider: "hf-inference",
		max_tokens: 500,
	});

	return response.choices[0].message.content;
}

async function main() {
    const query = "Tell me more about Debussys music";
	const mostRelevantPiece = await findMostRelevantPiece(query);
    console.log(mostRelevantPiece);
	const answer = await getAnswerFromMistral(mostRelevantPiece, query);
	console.log(answer);
}

main();
