const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");
const fs = require("fs");
const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
	const inputs = "An beautiful disposable camera image of the Eiffel Tower";
	const image = await client.textToImage({
		provider: "hf-inference",
		model: "black-forest-labs/FLUX.1-schnell",
		inputs,
		parameters: {
			num_inference_steps: 5,
			width: 1024,
			height: 768,
		},
	});
	console.log("Image has been generated, saving to file...");

    const buffer = await image.arrayBuffer();

	const filename = `${inputs.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
	fs.writeFileSync("generated-images/" + filename, Buffer.from(buffer));
}

main();
