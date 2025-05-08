const dotenv = require("dotenv/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-exp",
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

	// A sample JavaScript code snippet that might contain a vulnerability
	const codeSnippet = `
    function processUserInput(input) {
      // Potentially dangerous: using eval on user input
      return eval(input);
    }
  `;

	// Define the prompt for vulnerability analysis
	const vulnerabilityPrompt = `
  Please review the following JavaScript code for potential security vulnerabilities.
  If you identify a vulnerability, list it with a brief explanation as well as end your response with the word vulnerable in capital letters between <> like so: <VULNERABLE>; 
  otherwise, respond with "No vulnerabilities found."

  Code:
  ${codeSnippet}
  `;

	// Run the vulnerability check in parallel using 3 concurrent calls (voting style)
	const numVotes = 3;
	const vulnerabilityChecks = [];
	for (let i = 0; i < numVotes; i++) {
		vulnerabilityChecks.push(checkVulnerability(vulnerabilityPrompt));
	}

	// Wait for all responses concurrently
	const responses = await Promise.all(vulnerabilityChecks);
	const assessments = responses.map((res) => res.response.text().trim());

	console.log("Individual Vulnerability Assessments:");
	let vulnerableCount = 0;

	assessments.forEach((assessment, index) => {
		console.log(`Assessment ${index + 1}: ${assessment}`);

		// Count occurrences of <VULNERABLE>
		if (assessment.includes("<VULNERABLE>")) {
			vulnerableCount++;
		}
	});

	// Print the final result
	console.log(
		`\nNumber of assessments that marked the code as vulnerable: ${vulnerableCount} out of ${numVotes}`
	);

	if (vulnerableCount > numVotes / 2) {
		console.log("Final Verdict: The code is VULNERABLE!");
	} else {
		console.log("Final Verdict: The code is SAFE.");
	}
}

async function checkVulnerability(vulnerabilityPrompt) {
	const chatSession = model.startChat({
		generationConfig,
		history: [],
	});

	const response = await chatSession.sendMessage(vulnerabilityPrompt);
	return response;
}

run();
