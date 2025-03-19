const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

async function runModel() {
	const hf = new InferenceClient(process.env.HF_ACCESS_TOKEN);
	const result = await hf.textClassification({
		model: "openai-community/roberta-base-openai-detector", //SamLowe/roberta-base-go_emotions
		inputs: "It's an awful day in Stockholm",
	});
	console.log(result);
}

runModel();
