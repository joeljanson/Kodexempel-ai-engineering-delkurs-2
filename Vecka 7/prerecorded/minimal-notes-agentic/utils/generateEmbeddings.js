/**
 * Naïve splitter: breaks long text into ~chunkSize character chunks,
 * attempting to split on sentence boundaries.
 */

import { pipeline } from "@huggingface/transformers";

export async function generateSingleEmbedding(text, prefix = "") {
	/* TODO: call Hugging Face or OpenAI embedding model */
	const pipe = await pipeline("feature-extraction", "Supabase/gte-small");

	const output = await pipe(text, {
		pooling: "mean",
		normalize: true,
	});

	// Extract the embedding output
	const embedding = Array.from(output.data);

	return embedding;
}
