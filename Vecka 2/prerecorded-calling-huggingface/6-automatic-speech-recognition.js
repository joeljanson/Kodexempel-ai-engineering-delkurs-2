const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

const fs = require("fs");

async function main() {
	const data = fs.readFileSync("speech.wav");

	const output = await client.automaticSpeechRecognition({
		data,
		model: "openai/whisper-large-v3-turbo",
		provider: "hf-inference",
	});

	console.log(output);
}

main();
