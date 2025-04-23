const dotenv = require("dotenv");

dotenv.config();
const { InferenceClient } = require("@huggingface/inference");
const { createClient } = require("@supabase/supabase-js");
const { pipeline } = require("@huggingface/transformers");
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

const client = new InferenceClient(process.env.HF_TOKEN);

const pdfParse = require("pdf-parse");

async function parsePdf(pdfPath) {
	const pdf = await pdfParse(pdfPath);
	return pdf.text;
}

// ------------------------------------------------------------
// Split the text into chunks of 3200 characters with 1600 characters overlap
// This is taken from OpenAIs chunking strategy of 800 tokens and approximately half of that as overlap
// OpenAI uses an embedding dimension of 256 in their vector store. So we could probably use a larger chunk size
// for a larger embedding dimension.
// ------------------------------------------------------------

function splitText(text, chunkSize = 1500, overlapSize = 750) {
	const chunks = [];
	let startIndex = 0;

	while (startIndex < text.length) {
		// Get chunk of specified size
		const chunk = text.slice(startIndex, startIndex + chunkSize);
		chunks.push(chunk);

		// Move start index forward by chunkSize - overlapSize
		startIndex += chunkSize - overlapSize;
	}

	// Filter out any empty chunks
	return chunks.filter((chunk) => chunk.length > 0);
}

const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

async function splitTextWithLangchain(text, chunkSize = 1500, overlapSize = 750) {
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: chunkSize,
		chunkOverlap: overlapSize,
		separator: ["\n\n", "\n", ".", " ", ""],
	});
	const chunks = await splitter.createDocuments([text]);

	return chunks;
}

async function generateEmbeddings(chunks, prefix = "") {
	const inputChunks = chunks.map((chunk) => prefix + " " + chunk);
	const embeddings = await client.featureExtraction({
		model: "mixedbread-ai/mxbai-embed-large-v1",
		inputs: inputChunks,
		provider: "hf-inference",
	});

	return embeddings;
}

async function generateEmbeddingsWithTransformerModel(chunks) {
	/*
    https://huggingface.co/Supabase/gte-small
    Limitation:
    This model exclusively caters to English texts, and any lengthy texts will be truncated to a maximum of 512 tokens.
    This model is not able to handle non-English texts. And we have to split our text so it's never longer than 512 tokens.
    Approximately 2000 characters
    */

    const extractor = await pipeline(
			"feature-extraction",
			"Xenova/multilingual-e5-large"
		);

		// Compute sentence embeddings
		const embeddings = await extractor(chunks, {
			pooling: "mean",
			normalize: true,
		});
		console.log(embeddings);
		// Tensor {
		//   dims: [ 2, 768 ],
		//   type: 'float32',
		//   data: Float32Array(1536) [ 0.019079938530921936, 0.041718777269124985, ... ],
		//   size: 1536
		// }

	console.log(embeddings.tolist());
	return embeddings.tolist();
	/* const pipe = await pipeline(
		"feature-extraction",
		"mixedbread-ai/mxbai-embed-large-v1"
	);

	const embeddings = [];
	for (let i = 0; i < chunks.length; i++) {
		const output = await pipe(chunks[i].pageContent, {
			pooling: "mean",
			normalize: true,
		});

		// Extract the embedding output
		const embedding = Array.from(output.data);
		embeddings.push(embedding);
	}

	return embeddings; */
}

// ------------------------------------------------------------
// Store embeddings and chunks in a CSV file
// ------------------------------------------------------------

const fs = require("fs");
const path = require("path");

async function storeEmbeddingsToCSV(
	chunks,
	embeddings,
	outputPath = "embeddings.csv"
) {
	// Create CSV header
	let csvContent = "text,embedding\n";

	// Add each chunk and its corresponding embedding
	for (let i = 0; i < chunks.length; i++) {
		// Escape quotes in text and convert embedding array to string
		const escapedText = chunks[i].pageContent.replace(/"/g, '""');
		const embeddingStr = JSON.stringify(embeddings[i]);

		// Add row to CSV
		csvContent += `"${escapedText}","${embeddingStr}"\n`;
	}

	// Write to file
	await fs.promises.writeFile(outputPath, csvContent);
	console.log(`Embeddings stored in ${outputPath}`);
}

async function main() {
	const pdfPath = "zalando-2.pdf";
	const text = await parsePdf(pdfPath);
	const chunks = await splitTextWithLangchain(text, 2000, 1000);
	console.log(chunks);
	console.log(chunks.slice(0, 10));
	const embeddings = await generateEmbeddingsWithTransformerModel(chunks);
	await storeEmbeddingsToCSV(chunks, embeddings, "embeddings-e5-large.csv");
}

main();
