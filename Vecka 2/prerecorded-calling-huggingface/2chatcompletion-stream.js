const { dotenv } = require("dotenv/config");

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
	let out = "";

	const stream = client.chatCompletionStream({
		provider: "hf-inference",
		model: "mistralai/Mistral-7B-Instruct-v0.3",
		messages: [
			{
				role: "system",
				content: "You are a helpful assistant that can answer questions. Always answer quite lengthy and include a lot of details.",
			},
			{
				role: "user",
				content: "What is the capital of Sweden?",
			},
		],
		max_tokens: 1000,
	});

	for await (const chunk of stream) {
		if (chunk.choices && chunk.choices.length > 0) {
			const newContent = chunk.choices[0].delta.content;
			out += newContent;
			console.log(out);
		}
	}

	console.log("Final answer is: " + out);
}

main();
