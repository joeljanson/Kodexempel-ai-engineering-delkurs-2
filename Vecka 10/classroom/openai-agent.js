import OpenAI from "openai";
import dotenv from "dotenv";
import { addToMemory, getMemory, callFrenchAgent } from "./functions.js";

dotenv.config();

export class OpenAIAgent {
	constructor({
		systemInstructions = "",
		model = "gpt-4.1-nano",
		tools = [],
		apiKey = process.env.OPENAI_API_KEY,
	}) {
		this.openai = new OpenAI({ apiKey });
		this.model = model;
		this.history = [];
		this.systemInstructions = systemInstructions;
		this.tools = tools;
	}

	async chat(message) {
		// Add user message to history
		this.history.push({
			role: "user",
			content: message,
		});

		return await this._runFullTurn();
	}

	async _runFullTurn() {
		let iterations = 0;
		const maxIterations = 5;

		while (iterations < maxIterations) {
			iterations++;

			// Prepare messages array with system instructions and history
			const messages = [
				{
					role: "system",
					content: this.systemInstructions,
				},
				...this.history,
			];

			// Prepare the request
			const request = {
				model: this.model,
				messages: messages,
				...(this.tools.length > 0 && {
					tools: this.tools.map((tool) => ({
						type: "function",
						function: tool,
					})),
				}),
			};

			// Get model completion
			const response = await this.openai.chat.completions.create(request);
			const assistantMessage = response.choices[0].message;
			this.history.push(assistantMessage);

			// If no function call, return the content
			if (!assistantMessage.tool_calls) {
				return assistantMessage.content;
			}

			// Handle function calls
			for (const toolCall of assistantMessage.tool_calls) {
				const { name, arguments: args } = toolCall.function;
				const parsedArgs = JSON.parse(args);

				// Handle function calls here
				let result;
				if (name === "addToMemory") {
					result = await addToMemory(parsedArgs.memoryText, parsedArgs.expires);
					console.log("Called add to memory:", result);
				} else if (name === "getMemory") {
					result = getMemory();
					console.log("Called get memory:", result);
				} else if (name === "callFrenchAgent") {
					result = await callFrenchAgent(parsedArgs.message);
					console.log("Called call french agent:", result);
				} else {
					console.warn(`⚠️  Unknown tool call: ${name}`);
					result = `Error: no handler for ${name}`;
				}

				this.history.push({
					role: "tool",
					tool_call_id: toolCall.id,
					name: name,
					content: JSON.stringify({ result }),
				});
			}
		}
	}
}
