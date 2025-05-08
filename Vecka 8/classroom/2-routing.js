const dotenv = require("dotenv/config");
const {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-exp",
	systemInstruction: "You are a helpful AI-assistant",
});

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
};

async function run() {
	// Start a new chat session
	const chatSession = model.startChat({
		generationConfig,
		history: [],
	});

	// Example user query (you could imagine this coming from an API or frontend)
	const userQuery = "I have been charged twice on my credit card for a single purchase.";
	//const userQuery =
	//	"I'm having trouble logging in to my account, it only says password not valid";

	// Step 1: Routing - classify the query into a category.
	const routingPrompt = `
  Classify the following customer service query into one of the following categories: 
  "Technical Support", "Billing", or "General Inquiry". 
  Provide only the category name.
  
  Query: "${userQuery}"`;

	const routingResult = await chatSession.sendMessage(routingPrompt);
	const category = routingResult.response.text().trim();
	console.log("Category:", category);

	// Step 2: Based on the classified category, choose a specialized prompt.
	let specializedPrompt = "";
	if (category.toLowerCase().includes("billing")) {
		specializedPrompt = `You are a billing specialist. Provide a detailed and empathetic response to assist with this billing query: "${userQuery}"`;
	} else if (category.toLowerCase().includes("technical")) {
		specializedPrompt = `You are a technical support expert. Provide a step-by-step troubleshooting guide for this technical issue: "${userQuery}"`;
	} else {
		// Default to handling as a general inquiry.
		specializedPrompt = `Provide a clear and informative response to the following inquiry: "${userQuery}"`;
	}

	// Step 3: Get the final specialized response.
	const specializedResult = await chatSession.sendMessage(specializedPrompt);
	const finalResponse = specializedResult.response.text().trim();
	console.log("Final Response:", finalResponse);
}

run();
