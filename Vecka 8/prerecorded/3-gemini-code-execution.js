import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
	responseMimeType: "text/plain",
};

async function runCodeExecution() {
	const model = genAi.getGenerativeModel({
		model: "gemini-2.5-flash-preview-04-17",
		tools: [{ codeExecution: {} }],
	});

	const chatSession = model.startChat({
		generationConfig,
		history: [],
	});

	const result = await chatSession.sendMessage(`
        Could you write a python script that generates a chord progression from a starting chord?
        Use basic tonal harmony rules.
        The function should return a list of chords.
        Generate and run the code for the calculation and make sure your implementation works.
        `);

	console.log(JSON.stringify(result, null, 2));
	const code = result.response;
	console.log(code);
}

runCodeExecution();
