import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SYSTEM_PROMPT = `
Instructions:
You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved, or if you need more info from the user to solve the problem.

If you are not sure about anything pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

So always ask for more information if needed or if you are not sure about what to send in as an argument to a function.

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.
`.trim();

export async function generateResponse(message, { onFunctionCall } = {}) {
	const messages = [
		{
			role: "user",
			content: message,
		},
	];

	let iterations = 0;
	const maxIterations = 4;

	while (iterations < maxIterations) {
		iterations++;
		const response = await openai.responses.create({
			model: "gpt-4o",
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

				// GET BACK TO THE USER AND ASK FOR PERMISSION TO SEND!
				let confirmed = true;
				if (onFunctionCall) {
					console.log(
						"Asking user for permission to call function:",
						name,
						args
					);
					confirmed = await onFunctionCall(name, args);
				}
				let result;
				if (confirmed) {
					result = await callFunction(name, args);
				} else {
					// User declined the function call
					result = {
						declined: `User declined to call function '${name}'. Nothing went wrong but the user changed their mind. Inform the user that you won't call the function but let them know that you can help them again at a later stage.`,
					};
				}

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

function callFunction(name, args) {
	if (name === "send_email") {
		return sendEmail(args);
	} else {
		console.log("Unknown function:", name);
		return "Unknown function";
	}
}

function sendEmail(args) {
	console.log("Sending email:", args);
	return "Email sent to: " + args.to;
}

const tools = [
	{
		type: "function",
		name: "send_email",
		description:
			"Send an email to a given recipient with a subject and message.",
		parameters: {
			type: "object",
			properties: {
				to: {
					type: "string",
					description: "The recipient email address.",
				},
				subject: {
					type: "string",
					description: "Email subject line.",
				},
				body: {
					type: "string",
					description: "Body of the email message.",
				},
			},
			required: ["to", "subject", "body"],
			additionalProperties: false,
		},
	},
];

async function main() {
	await generateResponse(
		"Could you send an email to joel.janson.johansen@gmail.com about his last lecture, I really enjoyed it!",
		{
			onFunctionCall: async (name, args) => {
				console.log("Can the LLM send this email?", name, args);
				await new Promise((resolve) => setTimeout(resolve, 3000));
				return false;
			},
		}
	);
}

main();
