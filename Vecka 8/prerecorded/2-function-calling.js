import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const hf = new InferenceClient(process.env.HF_ACCESS_TOKEN);

const MODEL = "Qwen/Qwen2.5-72B-Instruct";
const PROVIDER = "hf-inference";

// Structured output ------------------------------------------------------------
/* 
const schema = {
	type: "object",
	properties: {
		location: { type: "string" },
		activity: { type: "string" },
		numberOfAnimalsSeen: { type: "integer", minimum: 1 },
		animalNames: { type: "array", items: { type: "string" } },
	},
	required: ["location", "activity", "numberOfAnimalsSeen", "animalNames"],
	additionalProperties: false,
}; */

// Function calling ------------------------------------------------------------
const functionSchema = {
	type: "function",
	function: {
		name: "routeUserRequest",
		description: "Route the user request to the correct agent",
		strict: true,
		parameters: {
			type: "object",
			properties: {
				agent: {
					type: "string",
					enum: ["customer service", "technical support", "general inquiry"],
					description: "The agent to route the user request to",
				},
			},
			required: ["agent"],
			additionalProperties: false,
		},
	},
};

async function runFunctionCall() {
	const messages = [
		{
			role: "system",
			content:
				"You are responsible for routing the user request to the correct agent.",
		},
		{
			role: "user",
			content:
				"I really like your product but I have a few suggestions for improvement.",
		},
	];

	const response = await hf.chatCompletion({
		model: MODEL,
		provider: PROVIDER,
		messages,
		tools: [functionSchema],
		//tool_choice: "any",
	});

	console.log(JSON.stringify(response, null, 2));
	/* 
	const parsed = JSON.parse(response.choices[0].message.content);
	const { location, activity, numberOfAnimalsSeen, animalNames } = parsed;

	console.log(`Location: ${location}`);
	console.log(`Activity: ${activity}`);
	console.log(`Number of animals seen: ${numberOfAnimalsSeen}`);
	console.log(`Animal names: ${animalNames.join(", ")}`); */
}

runFunctionCall();
