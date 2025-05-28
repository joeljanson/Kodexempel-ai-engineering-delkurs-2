// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function main(prompt) {
	const ai = new GoogleGenAI({
		apiKey: process.env.GEMINI_API_KEY,
	});
	const tools = [
		{
			functionDeclarations: [
				{
					//Vad ska vi ha för namn på vår funktion för att modellen ska förstå?
					name: "noName",
					//Vad ska vi ha för beskrivning av vår funktion för att modellen ska förstå?
					description: "No description",
					parameters: {
						type: Type.OBJECT,
						properties: {
							memoryText: {
								type: Type.STRING,
                                description: "Skriv en passande beskrivning"
							},
						},
                        required: ["memoryText"] //Glöm inte bort att lägga till nya properties här!
					},
				},
			],
		},
	];
	const config = {
		tools,
		responseMimeType: "text/plain",
		systemInstruction: [
			{
				text: `You are a helpful assistant. Here are memories: ${getMemory()}`,
				//Vad behöver vi ha för systeminstruktion för att modellen ska förstå att den ska lägga till minnen i minnesbanken?
			},
		],
	};
	const model = "gemini-2.0-flash";
	const messages = [
		{
			role: "user",
			parts: [
				{
					text: prompt,
				},
			],
		},
	];

	let iterations = 0;
	const maxIterations = 3;

	while (iterations < maxIterations) {
		iterations++;

		const response = await ai.models.generateContentStream({
			model,
			config,
			contents: messages,
		});
		const responseText = [];
		let shouldBreak = false;

		for await (const chunk of response) {
			if (chunk.functionCalls) {
				for (const functionCall of chunk.functionCalls) {
                    let result = "";
					if (functionCall.name === "addToMemory") {
                        //Här behöver vi lägga till argumenten för vår funktion
                        //Dessa argument definierar ni i era function schemas
                        // addToMemory(functionCall.args.memoryText)
						result = await addToMemory();
					} else if (functionCall.name === "getMemory") {
						result = await getMemory();
					}
					const functionResponsePart = {
						name: functionCall.name,
						response: { result },
					};

					messages.push({
						role: "model",
						parts: [{ functionCall: functionCall }],
					});

					messages.push({
						role: "user",
						parts: [{ functionResponse: functionResponsePart }],
					});
				}
			} else {
				console.log("Chunk:", chunk.text);
				responseText.push(chunk.text);
				if (chunk.candidates[0].finishReason === "STOP") {
					shouldBreak = true;
					break;
				}
			}
		}

		if (shouldBreak) {
			console.log("Final response:", responseText.join(""));
			break;
		}
	}
}

main("What is the weather in Stockholm?");
main("My name is Joel!");
main("What is my name?");

// ------------------------------------------------------------------------------------------------
// Definitions for the functions
// ------------------------------------------------------------------------------------------------

/* ---------- Funktioner för vår LLM ---------- */

/**
 * Hur behöver vi instruera vår LLM att lägga till nya minnen?
 * Hur behöver vi instruera vår LLM att hämta minnen?
 * Vad händer om vi inte har några minnen?
 * Hur kan vi instruera vår LLM att bara spara minnen som inte redan finns i minnesbanken?
 * Vad ber vi LLMen om att minnas?
 */

export async function addToMemory(memoryText, expires = false) {
	// keep the incoming snippet short & atomic
	console.log("addToMemory", memoryText, expires);
	memoryBank.push({ text: memoryText, expires: expires });
	await saveMemory();
	return "Memory added: " + memoryText;
}

export function getMemory() {
	return memoryBank.map((m) => m.text).join("\n");
}



/* ---------- Hjälpfunktion för att läsa och spara minnet - Vår llm behöver inte tillgång till dessa funktioner ---------- */
async function loadMemory() {
	try {
		memoryBank = JSON.parse(await fs.readFile(MEMORY_FILE, "utf8"));
	} catch {
		memoryBank = [];
	}
}
async function saveMemory() {
	await fs.writeFile(MEMORY_FILE, JSON.stringify(memoryBank, null, 2));
}

const MEMORY_FILE = "./memory_bank.json";

let memoryBank = [];
