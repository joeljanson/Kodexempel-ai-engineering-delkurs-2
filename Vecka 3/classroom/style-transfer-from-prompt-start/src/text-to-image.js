//Importera Huggingface Inference API från @huggingface/inference

// Skapa en client för att använda HF Inference API med ert Huggingface Token som ska läsas in från .env filen

import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(import.meta.env.VITE_HUGGINGFACE_API_TOKEN);

export async function generateImage(prompt) {
	const image = await client.textToImage({
		provider: "hf-inference",
		model: "black-forest-labs/FLUX.1-dev",
		inputs: prompt,
		parameters: { num_inference_steps: 5 },
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
		proxy: "https://cors-anywhere.herokuapp.com/",
	});

	return image;
}
