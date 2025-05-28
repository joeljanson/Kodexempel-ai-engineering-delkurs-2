import { Agent } from "./gemini-agent.js";
import { OpenAIAgent } from "./openai-agent.js";
import { callFrenchExpertSchema } from "./openai-function-declarations.js";

/* ---------- public “tool” functions ---------- */
export async function addToMemory(memoryText, expires = false) {
	// keep the incoming snippet short & atomic
	/* console.log("addToMemory", memoryText, expires);
memoryBank.push({ text: memoryText, expires: expires });
await saveMemory(); */
	return "Memory added: " + memoryText;
}

export function getMemory() {
	return "Not implemented";
}

export async function callFrenchAgent(message) {
	const frenchAgent = new OpenAIAgent({
		systemInstructions: "You are a French translator. You will get the text to translate and you will return the translation in French. Always provide some interesting random facts about french art and literature.",
	});
	const response = await frenchAgent.chat(message);
	return response;
}

export async function callFrenchExpert(message) {
	const frenchExpert = new OpenAIAgent({
		systemInstructions:
			"You are an expert in french art and literature, when called always provide some interesting random facts about french art and literature.",
	});
	const response = await frenchExpert.chat(message);
	return response;
}

export async function callEnglishAgent(message) {
	const englishAgent = new OpenAIAgent({
		systemInstructions:
			`You are a English translator. 
            You will get the text to translate and you will return the translation in English. 
            Always call the french expert to provide some interesting random facts about french art and literature.
            Only call the french expert once. Based on your translation of the original query.
            In your response. First declare the translation. Then add the info from the french expert but very short and concise.`,
		tools: [callFrenchExpertSchema],
        model: "gpt-4.1-mini",
	});
	const response = await englishAgent.chat(message);
	return response;
}