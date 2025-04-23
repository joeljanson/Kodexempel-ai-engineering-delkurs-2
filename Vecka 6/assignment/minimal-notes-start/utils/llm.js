import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const inferenceClient = new InferenceClient(process.env.HF_API_KEY);

export async function callLLM({ query, matches }) {
	const prompt = `Question: ${query}
Context: ${matches
		.map((match) => `Entry text:${match.text} (Timestamp: ${match.created_at})`)
		.join("\n")}`;
	console.log("prompt: ", prompt);

	/*
    Implementera en funktion som anropar en LLM.
    Använd en av de modeller som finns tillgängliga på Hugging Face.
    Förslagsvis: meta-llama/Llama-3.1-8B-Instruct
    */

	const response = "placeholder-response";
	return response;
}
