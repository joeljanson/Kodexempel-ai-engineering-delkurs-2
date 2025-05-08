const dotenv = require("dotenv/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Maximum number of evaluation-optimization iterations
const MAX_ITERATIONS = 4;

// Generation configuration
const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
};

// Create specialized LLM agents with appropriate system instructions
const generatorModel = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-exp",
	systemInstruction:
		"You are a creative marketing copywriter. Generate persuasive marketing copy that's compelling, clear, and engaging.",
	generationConfig,
});

const evaluatorModel = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-exp",
	systemInstruction:
		"You are an expert marketing evaluator. Evaluate marketing copy on persuasiveness, clarity, and tone. Provide up to three concise bullet points of feedback on how it could be improved.",
	generationConfig,
});
const evaluatorChatSession = evaluatorModel.startChat({
	generationConfig,
	history: [],
});

const optimizerModel = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-exp",
	systemInstruction:
		"You are a marketing expert who improves marketing copy based on feedback. You take evaluator feedback and the original copy to produce an enhanced version.",
	generationConfig,
});
const optimizerChatSession = optimizerModel.startChat({
	generationConfig,
	history: [],
});

async function generateInitialCopy() {
	const prompt =
		"Generate a persuasive marketing copy for our new eco-friendly smartwatch, highlighting its innovative health tracking features, sustainability, and modern design.";
	const result = await generatorModel.generateContent(prompt);
	return result.response.text().trim();
}

async function evaluateCopy(marketingCopy) {
	const prompt = `Marketing Copy:\n"${marketingCopy}"`;
	console.log(JSON.stringify(await evaluatorChatSession.getHistory(), null, 2));
	const result = await evaluatorChatSession.sendMessage(prompt);
	return result.response.text().trim();
}

async function optimizeCopy(marketingCopy, evaluatorFeedback) {
	const prompt = `Evaluator Feedback:\n"${evaluatorFeedback}"\n\nOriginal Marketing Copy:\n"${marketingCopy}"\n\nPlease provide an enhanced version of the marketing copy.`;
	console.log(JSON.stringify(await optimizerChatSession.getHistory(), null, 2));
	const result = await optimizerChatSession.sendMessage(prompt);
	return result.response.text().trim();
}

async function run() {
	// Generate initial marketing copy
	let currentCopy = await generateInitialCopy();
	console.log("Initial Marketing Copy:\n", currentCopy);

	// Iterative evaluation and optimization loop
	for (let i = 0; i < MAX_ITERATIONS; i++) {
		console.log(`\n--- Iteration ${i + 1}/${MAX_ITERATIONS} ---`);

		// Evaluator step
		const evaluatorFeedback = await evaluateCopy(currentCopy);
		console.log("\nEvaluator Feedback:\n", evaluatorFeedback);

		// Optimizer step
		const optimizedCopy = await optimizeCopy(currentCopy, evaluatorFeedback);
		console.log("\nOptimized Marketing Copy:\n", optimizedCopy);

		// Update current copy for next iteration
		currentCopy = optimizedCopy;
	}

	console.log("\n--- Final Marketing Copy ---\n", currentCopy);
}

run().catch((err) => console.error("Error:", err));
