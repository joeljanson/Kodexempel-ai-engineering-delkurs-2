const { config } = require("dotenv");
config();

const { OpenAI } = require("openai");

const client = new OpenAI({
	baseURL:
		"https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1",
	apiKey: process.env.HF_TOKEN,
});

async function main() {
	let out = "";
	const stream = await client.chat.completions.create({
		model: "mistralai/Mistral-7B-Instruct-v0.3",
		messages: [
			{
				role: "system",
				content:
					"You are a helpful assistant that can answer questions. Always answer quite lengthy and include a lot of details.",
			},
			{
				role: "user",
				content: "What is the capital of Sweden?",
			},
		],
		max_tokens: 1000,
		stream: true,
	});

	for await (const chunk of stream) {
		if (chunk.choices && chunk.choices.length > 0) {
			const newContent = chunk.choices[0].delta.content;
			out += newContent;
			console.log(out);
		}
	}
}

main();
