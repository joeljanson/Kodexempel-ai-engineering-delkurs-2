const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

const fs = require("fs");

async function main() {
	const image = fs.readFileSync(
		"generated-images/an_beautiful_disposable_camera_image_of_the_eiffel_tower.png"
	);

	const output = await client.imageToText({
		provider: "hf-inference",
		model: "Salesforce/blip-image-captioning-base",
		inputs: image,
	}); 

	console.log(output);
}

main();