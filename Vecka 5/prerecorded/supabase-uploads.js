// ------------------------------------------------------------
// Generate embeddings for a given text using the Hugging Face API
// ------------------------------------------------------------

const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");
const { pipeline } = require("@huggingface/transformers");
const { createClient } = require("@supabase/supabase-js");

const client = new InferenceClient(process.env.HF_TOKEN);
console.log("Client created: ", client);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------
// Start by parsing the PDF into text using pdf-parse (not needed if you just use text)
// ------------------------------------------------------------

const pdfParse = require("pdf-parse");

async function parsePdf(pdfPath) {
	const pdfData = await pdfParse(pdfPath);
	return pdfData.text;
}

// ------------------------------------------------------------
// Split the text into chunks of 3200 characters with 1600 characters overlap
// This is taken from OpenAIs chunking strategy of 800 tokens and approximately half of that as overlap
// OpenAI uses an embedding dimension of 256 in their vector store. So we could probably use a larger chunk size
// for a larger embedding dimension.
// ------------------------------------------------------------

function splitText(text, chunkSize = 3200, overlapSize = 1600) {
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

// ------------------------------------------------------------
// Generate embeddings for a given text using the Hugging Face API
// ------------------------------------------------------------

async function generateEmbeddingsWithInferenceClient(chunks, prefix = "") {
	//intfloat/multilingual-e5-large - needs prefixes "query: " and "passage: "
	//mixedbread-ai/mxbai-embed-large-v1 - needs query prefix "Represent this sentence for searching relevant passages: "
	const inputs = chunks.map((chunk) => prefix + chunk);
	const embeddings = await client.featureExtraction({
		model: "intfloat/multilingual-e5-large",
		inputs: inputs,
		provider: "hf-inference",
		wait_for_model: true,
	});

	return embeddings;
}

async function generateEmbeddingsWithTransformerModel(chunks) {
	const pipe = await pipeline("feature-extraction", "Supabase/gte-small");

	const embeddings = [];

	for (const chunk of chunks) {
		// Generate the embedding from text
		const output = await pipe(chunk, {
			pooling: "mean",
			normalize: true,
		});

		// Extract the embedding output
		const embedding = Array.from(output.data);

		embeddings.push(embedding);
	}

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
	let csvContent = "text,embedding\n";

	for (let i = 0; i < chunks.length; i++) {
		const escapedText = chunks[i].replace(/"/g, '""');
		const embeddingStr = JSON.stringify(embeddings[i]);
		csvContent += `"${escapedText}","${embeddingStr}"\n`;
	}

	await fs.promises.writeFile(outputPath, csvContent);
	console.log(`Embeddings stored in ${outputPath}`);
}

async function uploadEmbeddingToSupabase(text, embedding) {
	const { data, error } = await supabase.from("embeddings").insert({
		text: text,
		embedding: embedding,
	});

	if (error) {
		console.error("Error uploading embedding to Supabase:", error);
	}
}

async function uploadEmbeddingsToSupabase(chunks, embeddings) {
	const rows = chunks.map((text, index) => ({
		text: text,
		embedding: embeddings[index],
	}));

	const { data, error } = await supabase.from("embeddings").insert(rows);

	if (error) {
		console.error("Error uploading embeddings to Supabase:", error);
	}
}

async function main() {
	//const text = await parsePdf("return-policies.pdf");
	//console.log(text);
	//const chunks = splitText(text, 1000, 500);
	//console.log(chunks);
	//console.log("One chunk:", chunks[0]);
	const text = "Hejsan!";
	//const embeddings = await generateEmbeddingsWithTransformerModel([text]);
	//console.log(embeddings);
	//await storeEmbeddingsToCSV(chunks, embeddings, "gte-embeddings.csv");
	//await uploadEmbeddingsToSupabase(chunks, embeddings);
	//await uploadEmbeddingToSupabase(text, embeddings[0]);
	await callEdgeFunction(text);
}

main();

// ------------------------------------------------------------
// Call an edge function to get the embeddings and store them in Supabase
// ------------------------------------------------------------

async function callEdgeFunction(text) {
    const response = await fetch(
			`${supabaseUrl}/functions/v1/store-embedding`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${supabaseKey}`,
				},
				body: JSON.stringify({ text }),
			}
	);
	if (!response.ok) {
		const errorBody = await response.text();
		console.error("Error body:", errorBody);
		throw new Error("Failed to call edge function");
	}

	const data = await response.json();
	console.log(data);
}
