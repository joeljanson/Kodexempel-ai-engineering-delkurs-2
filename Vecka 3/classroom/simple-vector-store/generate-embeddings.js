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

async function main() {
	const classicalData = JSON.parse(fs.readFileSync("classical.json", "utf8"));

    const piecesWithEmbeddings = await Promise.all(
        classicalData.pieces.map(async (piece) => {
            const combinedText = `Title: ${piece.title} Description: ${piece.description} Duration: ${piece.duration}`;
            const embedding = await generateEmbedding(combinedText);
            return {
                ...piece,
                embedding,
            };
        })
    )

    const outputData = {
        pieces: piecesWithEmbeddings,
    }

	fs.writeFileSync(
		"classical-embeddings.json",
		JSON.stringify(outputData, null, 2)
	);
	console.log("Embeddings saved to classical-embeddings.json");
}

main();
