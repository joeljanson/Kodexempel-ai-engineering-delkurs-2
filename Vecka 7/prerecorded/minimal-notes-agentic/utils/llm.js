import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();

const inferenceClient = new InferenceClient(process.env.HF_API_KEY);

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

const MODEL = "Qwen/Qwen2.5-72B-Instruct";
const PROVIDER = "hf-inference";

export async function callLLM({ query }) {
	const messages = [
		{
			role: "system",
			content: `Todays date is ${new Date().toISOString().split("T")[0]}. You are a helpful assistant that can answer questions and help with tasks.`,
		},
		{
			role: "user",
			content: query,
		},
	];

	let iteration = 0;
	const MAX_ITERATIONS = 2;

	while (iteration < MAX_ITERATIONS) {
		iteration++;
		const response = await inferenceClient.chatCompletion({
			model: MODEL,
			provider: PROVIDER,
			messages: messages,
			tools: [retrieveDataBetweenDatesSchema, addToMemorySchema],
			tool_choice: "auto",
		});

		const responseMessage = response.choices[0].message;
		messages.push(responseMessage);

		if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
			for (const toolCall of responseMessage.tool_calls) {
				const functionName = toolCall.function.name;
				const functionArgs = JSON.parse(toolCall.function.arguments);
				console.log("Function name: ", functionName);
				console.log("Function args: ", functionArgs);
				const functionResult = await callFunction(functionName, functionArgs);
				console.log("Function result: ", functionResult);
				messages.push({
					role: "tool",
					tool_call_id: toolCall.call_id,
					content: JSON.stringify(functionResult),
					name: functionName,
				});
			}
		} else {
			if (responseMessage.content) {
				return responseMessage.content;
			} else {
				return (
					"No content was returned from the LLM. This was the response: " +
					JSON.stringify(response, null, 2)
				);
			}
		}
	}
}

// -------------  Utils -----------------------------------

async function callFunction(name, args) {
	if (name === "retrieveDataBetweenDates") {
		return await retrieveDataBetweenDates(args.start_date, args.end_date);
	} else if (name === "addToMemory") {
		return await addToMemory(args.memoryText);
	} else {
		return "No function found";
	}
}

// ------------------------- Function schemas-----------------------------------

const retrieveDataBetweenDatesSchema = {
	type: "function",
	function: {
		name: "retrieveDataBetweenDates",
		description: "Retrieves data from Supabase in between two specified dates",
		parameters: {
			type: "object",
			required: ["start_date", "end_date"],
			properties: {
				start_date: {
					type: "string",
					description:
						"The start date for the data retrieval in ISO 8601 format",
				},
				end_date: {
					type: "string",
					description: "The end date for the data retrieval in ISO 8601 format",
				},
			},
		},
	},
};

const addToMemorySchema = {
	type: "function",
	function: {
		name: "addToMemory",
		description: `When the user tells you something factual about themselves,
         their life, or their preferences, call this function.
         
         Keep the memoryText short and concise.`,
		parameters: {
			type: "object",
			properties: {
				memoryText: {
					type: "string",
					description: "Text to add to the memory bank",
				},
			},
			required: ["memoryText"],
		},
	},
};

// ------------------------- Function implementations-----------------------------------

async function retrieveDataBetweenDates(start_date, end_date) {
	console.log("start_date: ", start_date);
	console.log("end_date: ", end_date);
	const { data, error } = await supabase
		.from("notes")
		.select("content, created_at")
		.lte("created_at", end_date)
		.gte("created_at", start_date);

	console.log("The data retrieved: ", data);
	return data;
}

async function addToMemory(content) {
	const { data, error } = await supabase
		.from("memories")
		.insert({ memory: content })

	if (error) {
		console.error("Error inserting memory: ", error);
		return "Error inserting memory";
	}

	console.log("The data inserted: ", content);
	return content;
}