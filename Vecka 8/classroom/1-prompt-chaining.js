const dotenv = require("dotenv");
dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

//console.log(process.env.GEMINI_API_KEY)

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
	
};

async function main() {
	const chatSession = model.startChat({
		generationConfig,
		history: [],
	});

	//1. Skicka en förfrågan om en marknadsförningsc op

	const prompt1 =
		"Please generate a creative marketing copy for our new eco-friendly water bottle. Provide only one option. No additional text. Only the marketing copy.";
	const response1 = await chatSession.sendMessage(prompt1);
	const marketingCopy = response1.response.text().trim();
	console.log("Response 1:", marketingCopy);


    const chatSession2 = model.startChat({
			generationConfig,
			history: [],
		});
	const prompt2 =
		"Please translate the following text to Swedish: " + marketingCopy;
	const response2 = await chatSession2.sendMessage(prompt2);
	const translatedMarketingCopy = response2.response.text().trim();
	console.log("Response 2:", translatedMarketingCopy);
}

main();
