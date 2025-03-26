import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
import { KokoroTTS } from "kokoro-js";

dotenv.config();

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY); //Se till att ni har en .env fil med en HUGGINGFACE_API_KEY



/*

Se om ni kan utöka detta exempel genom att använda en spech-to-text modell
för att transkribera vad användaren säger och sedan använda den texten för att
generera en respons med hjälp av chatboten.

TIPS: Detta är aningen enklare att göra i en webbapplikation.
Så jag skulle kanske ta denna kod och bygga ett gränssnitt där
för att kunna ha en knapp man kan trycka på när man vill spela in ljud
och ett lite bättre sätt att spela upp ljudet.

*/



async function main() {
	const chatCompletion = await client.chatCompletion({
		provider: "hf-inference",
		model: "mistralai/Mistral-7B-Instruct-v0.3",
		messages: [
			{
				role: "system",
				content:
					"You are a helpful assistant that can answer questions and help with tasks. Always answer with only three sentences and only text. No markdown or code.",
			},
			{
				role: "user",
				content: "tell me fun facts about stockholm?",
			},
		],
		max_tokens: 1000,
	});

	const response = chatCompletion.choices[0].message.content;

	console.log(response);

    const model_id = "onnx-community/Kokoro-82M-ONNX";
		const tts = await KokoroTTS.from_pretrained(model_id, {
			dtype: "fp32", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
		});

	const text = response;
	const audio = await tts.generate(text, {
		// Use `tts.list_voices()` to list all available voices
		voice: "af_bella",
	});
		audio.save("audio.wav");
}

main();




