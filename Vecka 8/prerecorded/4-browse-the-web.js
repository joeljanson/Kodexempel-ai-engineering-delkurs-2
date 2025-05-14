import { OpenAI } from "openai";
import { convert } from "html-to-text";
import dotenv from "dotenv";

// To install: npm i @tavily/core
import { tavily } from "@tavily/core";

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

const DEFAULT_SYSTEM_PROMPT = `
Instructions:
Todays date is ${new Date().toLocaleDateString()}.
You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved, or if you need more info from the user to solve the problem.

If you are not sure about anything pertaining to the user's request, use your tools to read files, browse the web and visit websites and gather the relevant information: do NOT guess or make up an answer.

So always ask for more information if needed or if you are not sure about what to send in as an argument to a function.

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.
`.trim();

async function generateResponse(prompt) {
	const messages = [{ role: "user", content: prompt }];

	let iterations = 0;
	const maxIterations = 4;

	while (iterations < maxIterations) {
		iterations++;
		const response = await openai.responses.create({
			model: "gpt-4o-mini",
			input: messages,
			instructions: DEFAULT_SYSTEM_PROMPT,
			tools: tools,
		});

		//console.log("Assistant response:", JSON.stringify(response, null, 2));

		for (const message of response.output) {
			messages.push(message);

			if (message.type === "function_call") {
				const name = message.name;
				const args = JSON.parse(message.arguments);

				const result = await callFunction(name, args);

				console.log("Result: ", result);
				messages.push({
					type: "function_call_output",
					call_id: message.call_id,
					output: JSON.stringify(result),
				});
			} else {
				console.log("Not a function call:", message);
				return message.content[0].text;
			}
		}
	}
}

//--------------------------------
// Function implementations
//--------------------------------

async function browseWeb(args) {
	console.log("Browsing web:", args);
	const searchResults = await client.search((args.search_query), {
		timeRange: "month",
		includeAnswer: "basic",
	});
	console.log("Search results:", searchResults);
	return searchResults.results.slice(0, 3);
}

async function visitWebsite(args) {
	console.log("Visiting website:", args);
	const response = await fetch(args.url);
	const html = await response.text();
	console.log("HTML:", html);

	const options = {
		wordwrap: 130,
	};
	const text = convert(html, options);
	console.log(text);

	return text;
}

//--------------------------------
// Helper functions
//--------------------------------

function callFunction(name, args) {
	if (name === "browseWeb") {
		return browseWeb(args);
	} else if (name === "visitWebsite") {
		return visitWebsite(args);
	} else {
		console.log("Unknown function:", name);
		return "Unknown function - Please let the user know that something went wrong in calling the function.";
	}
}

//--------------------------------
// Tool definitions
//--------------------------------

const tools = [
	{
		type: "function",
		name: "browseWeb",
		description: "Browse the web for information about a given topic.",
		parameters: {
			type: "object",
			properties: {
				search_query: {
					type: "string",
					description: "The query to search for.",
				},
			},
			required: ["search_query"],
			additionalProperties: false,
		},
	},
	{
		type: "function",
		name: "visitWebsite",
		description: "Visits a given website and returns the HTML content.",
		parameters: {
			type: "object",
			properties: {
				url: {
					type: "string",
					description: "The URL to visit.",
				},
			},
			required: ["url"],
			additionalProperties: false,
		},
	},
];

async function main() {
	const response = await generateResponse(
		"Hwo do I use the Tone.Transport properly? Please search the web for an answer."
	);
	/* const response = await generateResponse(
		"Could you explain the infinity series based on this blog post? https://www.lawtonhall.com/blog/2019/9/9/per-nrgrds-infinity-series"
	); */
	console.log("Response:", response);
}

main();
