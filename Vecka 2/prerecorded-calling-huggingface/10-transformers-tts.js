const { pipeline } = require("@huggingface/transformers");

const wavefile = require("wavefile");
const fs = require("fs");

async function main() {
	// Create a text-to-speech pipeline
	const synthesizer = await pipeline("text-to-speech", "Xenova/speecht5_tts", {
		dtype: "fp32",
	});

	const inputs = "Hello, it is wonderful to use transformers.js";

	// Generate speech
	const speaker_embeddings =
		"https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin";
	const result = await synthesizer(inputs, {
		speaker_embeddings,
	});

	const wav = new wavefile.WaveFile();
	wav.fromScratch(1, result.sampling_rate, "32f", result.audio);
	const filename = `${inputs.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.wav`;
	fs.writeFileSync(filename, wav.toBuffer());
}

main();
