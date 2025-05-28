import { Agent } from "./gemini-agent.js";
import { OpenAIAgent } from "./openai-agent.js";

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