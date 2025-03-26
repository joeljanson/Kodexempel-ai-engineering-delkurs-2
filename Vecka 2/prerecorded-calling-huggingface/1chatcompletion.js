const { dotenv } = require("dotenv/config");

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
    
	const chatCompletion = await client.chatCompletion({
		provider: "hf-inference",
		model: "mistralai/Mistral-7B-Instruct-v0.3",
		//model: "google/gemma-2-2b-it",
		messages: [
			{
				role: "user",
				content: "What is the capital of France?",
			},
		],
		max_tokens: 500,
	});

    console.log(chatCompletion);
	console.log(chatCompletion.choices[0].message);
}

main();
