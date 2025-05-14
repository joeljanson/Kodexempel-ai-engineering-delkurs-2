// ------------------------------------------------------------
/**
 * Instruktion för uppgift:
 * Hur skapade jag mitt responseSchema för att få följande utdata?
 * 
 {
  "abstract": "Prompting results optimize model performance and training. Refining our methods promises transformative enhancements.",
  "authors": [
    "Noah MacCullum from OpenAI",
    "Julian Lee from OpenAI"
  ],
  "keywords": [
    "pROMPtinG",
    "gPT-4.1",
    "aGENTs",
    "lANGUagE",
    "mODELs"
  ],
  "title": "Unlocking Latent Brilliance: Crafting Prompts for GPT-4.1's Dawn"
}
 * Försök återskapa detta responseSchema. Ni har fått titeln nedan.
 * Alltså: 
 * 1. Uppdatera responseSchema så att det blir korrekt.
 * 2. Uppdatera systemInstruction så att modellen får hjälp med att lösa uppgiften. (Om detta behövs)
 */

// ------------------------------------------------------------

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node
// Add your API key to the .env file as GEMINI_API_KEY

import { GoogleGenAI, Type } from "@google/genai";

const responseSchema = {
	type: Type.OBJECT,
	properties: {
		title: {
			type: Type.STRING,
			description: "Make it poetic",
		},
	},
};

const systemInstruction = [
	{
		text: `You are a helpful assistant that needs a better instruction.`,
	},
];

// ------------------------------------------------------------

async function main() {
	const ai = new GoogleGenAI({
		apiKey: process.env.GEMINI_API_KEY,
	});
	const config = {
		responseMimeType: "application/json",
		responseSchema: responseSchema,
		systemInstruction: systemInstruction,
	};
	const model = "gemini-2.5-flash-preview-04-17";
	const contents = [
		{
			role: "user",
			parts: [
				{
					text: exampleText,
				},
			],
		},
	];

	const response = await ai.models.generateContentStream({
		model,
		config,
		contents,
	});
	for await (const chunk of response) {
		console.log(chunk.text);
	}
}

// Hämtad från https://cookbook.openai.com/examples/gpt4-1_prompting_guide

const exampleText = `
By: Noah MacCullum and Julian Lee from OpenAI

The GPT-4.1 family of models represents a significant step forward from GPT-4o in capabilities across coding, instruction following, and long context. In this prompting guide, we collate a series of important prompting tips derived from extensive internal testing to help developers fully leverage the improved abilities of this new model family.

Many typical best practices still apply to GPT-4.1, such as providing context examples, making instructions as specific and clear as possible, and inducing planning via prompting to maximize model intelligence. However, we expect that getting the most out of this model will require some prompt migration. GPT-4.1 is trained to follow instructions more closely and more literally than its predecessors, which tended to more liberally infer intent from user and system prompts. This also means, however, that GPT-4.1 is highly steerable and responsive to well-specified prompts - if model behavior is different from what you expect, a single sentence firmly and unequivocally clarifying your desired behavior is almost always sufficient to steer the model on course.

Please read on for prompt examples you can use as a reference, and remember that while this guidance is widely applicable, no advice is one-size-fits-all. AI engineering is inherently an empirical discipline, and large language models are inherently nondeterministic; in addition to following this guide, we advise building informative evals and iterating often to ensure your prompt engineering changes are yielding benefits for your use case.

`;

main();
