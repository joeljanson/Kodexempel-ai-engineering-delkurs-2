// ------------------------------------------------------------
/**
 * Instruktion för uppgift:
 * Skapa ett workflow eller en utförlig system instruction som kan användas för att bygga en hemsida.
 * Jobba gärna med de workflows vi fått med oss sedan tidigare
 * 
 * Prompt chaining - Dela upp skapandet i flera steg.
 * 
 * Orchestrator-workers - Använd en orchestrator antingen för att dela upp uppgiften eller 
 * för att få olika förslag på lösningar och sedan välja ut det bästa från alla förslag.
 * 
 * Evaluator-optimizer för att dubbelkolla att koden ser bra ut.
 * 
 * 1. Modellen ska returnera en enda HTML-fil och endast html, css och javascript.
 * 2. Modellen ska använda tailwind css via CDN (behöver vi kanske lägga in en script tag i prompten (few shot example))
 * 3. Modellen ska utöka användarens prompt med fler detaljer om användbar funktionalitet. Vilka fler funktioner skulle kunna vara användbara för en todo-lista ex.?
 * 4. Hemsidan ska inte innehålla någon footer.
 * 5. Hemsidan ska innehålla minst två bilder (behöver vi ange url:er i prompten?)
 * 6. Hemsidan ska innehålla ett fördefinierat färgschema. Med specifika RGB-värden.
 * Bonus: Använd structured output eller function calling för att få modellen att spara html filen till disk.
 * 
 * Antingen så bygger ni vidare i denna kod eller så jobbar ni på https://aistudio.google.com/
 * Om ni jobbar på https://aistudio.google.com/ så kan ni använda https://editor.p5js.org/ för att testa hemsidan.
 * 
 * 
 * 
 * Vidare:
 * Testa olika modeller (hitta olika modeller här: https://aistudio.google.com/)
 * Testa olika temperaturer.
 * Testa olika prompting tekniker (tailwind css ex. kan komma att behöva några exempel (few shot) på hur vi kan använda det i webbläsaren, är annorlunda jämfört med att använda det som npm)
 * Använd delimiters för att förtydliga prompten.
 * Testa olika typer av hemsidor (kan ni implementera andra ramverk? Ex. Tone.js? :))
 * Kan vi lägga in fonter?
 * Hur långt kan ni ta det? Kan ni bygga en hemsida med flera sidor?
 * Kan ni bygga en hemsida där användaren kan interagera med hemsidan?
 */

// ------------------------------------------------------------

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node
// Add your API key to the .env file as GEMINI_API_KEY


import { GoogleGenAI } from "@google/genai";

const systemInstruction = [
	{
		text: `You are a helpful assistant that needs a better instruction.`,
	},
];

async function buildWebsite(prompt) {
	const ai = new GoogleGenAI({
		apiKey: process.env.GEMINI_API_KEY,
	});
	const config = {
		responseMimeType: "text/plain",
		systemInstruction: systemInstruction,
	};
	const model = "gemini-2.5-pro-preview-05-06";
	const contents = [
		{
			role: "user",
			parts: [
				{
					text: prompt,
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

buildWebsite("Could you build a note taking app for me?");
