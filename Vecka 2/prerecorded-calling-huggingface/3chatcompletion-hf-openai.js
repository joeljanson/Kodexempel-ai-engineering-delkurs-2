const { config } = require("dotenv");
config();

const { OpenAI } = require("openai");

const client = new OpenAI({
	baseURL:
		"https://router.huggingface.co/hf-inference/models/google/gemma-2-2b-it/v1",
	apiKey: process.env.HF_TOKEN,
});

async function main() {
	const chatCompletion = await client.chat.completions.create({
		model: "google/gemma-2-2b-it",
		messages: [
			{
				role: "user",
				content: "What is the capital of France?",
			},
		],
		max_tokens: 500,
	});

	console.log(chatCompletion.choices[0].message);
}

main();
