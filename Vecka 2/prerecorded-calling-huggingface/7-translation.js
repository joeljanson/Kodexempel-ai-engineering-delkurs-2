const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
	const output = await client.translation({
		model: "facebook/mbart-large-50-many-to-many-mmt",
		inputs: "Now, La Reda de la Mejus, Garacult's dramatic masterpiece. Look at the pain, the movement. This is more than a painting, it is a tragedy frozen in time. And here, La Liberté, Guident, La Pupil, de Lacroix's vision of revolution. Passion, struggle, triumph, all in one canvas. Feel it, this, Messamys, is art. Shall we continue?",
		provider: "hf-inference",
		parameters: {
			src_lang: "en_XX",
			tgt_lang: "sv_SE",
		},
	});

	console.log(output);
}

main();