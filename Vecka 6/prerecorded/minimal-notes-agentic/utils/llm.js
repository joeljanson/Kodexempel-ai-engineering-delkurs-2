import { InferenceClient } from "@huggingface/inference";
import OpenAI from "openai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();

const inferenceClient = new InferenceClient(process.env.HF_API_KEY);
const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

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

const tools = [
	{
		type: "function",
		name: "retrieveDataBetweenDates",
		description: "Retrieves data from Supabase in between two specified dates",
		strict: true,
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
			additionalProperties: false,
		},
	},
];

async function callFunction(name, args) {
	if (name === "retrieveDataBetweenDates") {
		return await retrieveDataBetweenDates(
			args.start_date,
			args.end_date
		);
	}
}

export async function callLLM({ query }) {
	
	const input = [
		{
			role: "user",
			content: query,
		},
	];

    	const systemInstructions = `Todays date is ${
    		new Date().toISOString().split("T")[0]
    	}. 
        You are a helpful assistant that can retrieve by using the tools that are provided
        When giving the final answer, don't list the dates, answer in a more compelling encouraging way.`;
	console.log("System instructions: ", systemInstructions);
	const response = await client.responses.create({
		model: "gpt-4o-mini",
		instructions: systemInstructions,
		input: input,
		tools: tools,
	});

	//console.log("Response 1: ", JSON.stringify(response, null, 2));

	for (const toolCall of response.output) {
		if (toolCall.type !== "function_call") {
			continue;
		}

		const name = toolCall.name;
		const args = JSON.parse(toolCall.arguments);

		const result = await callFunction(name, args);
		console.log("Result: ", result);
		input.push({
			type: "function_call_output",
			call_id: toolCall.call_id,
			output: JSON.stringify(result),
		});
		//input.push({ role: "user", content: result.toString() });
	}

	//console.log("Input: ", input);

	const secondResponse = await client.responses.create({
		model: "gpt-4o-mini",
		instructions: systemInstructions,
		input,
		previous_response_id: response.id,
	});

	console.log("Response 2: ", secondResponse.output_text);

	return secondResponse.output_text;
}
