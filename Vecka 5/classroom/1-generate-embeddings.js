const dotenv = require("dotenv");

dotenv.config();
const { InferenceClient } = require("@huggingface/inference");
const { createClient } = require("@supabase/supabase-js");

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

async function generateEmbeddings(chunks, prefix = "") {
	const inputChunks = chunks.map((chunk) => prefix + " " + chunk);
	const embeddings = await client.featureExtraction({
		model: "intfloat/multilingual-e5-large",
		inputs: inputChunks,
		provider: "hf-inference",
	});

	return embeddings;
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
		const escapedText = chunks[i].replace(/"/g, '""');
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
	const chunks = splitText(text, 1500, 750);
	const embeddings = await generateEmbeddings(chunks, "passage: ");
	await storeEmbeddingsToCSV(chunks, embeddings, "embeddings-2.csv");
}

main();
