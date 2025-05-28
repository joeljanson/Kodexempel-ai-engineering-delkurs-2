export const addToMemorySchema = {
	name: "addToMemory",
	description:
		"When the user tells you something factual about themselves, their life, or their preferences, call this function. Keep the memoryText short and concise.",
	parameters: {
		type: "object",
		properties: {
			memoryText: {
				type: "string",
				description: "Text to add to the memory bank",
			},
			expires: {
				type: "boolean",
				description: "Whether this memory should auto-expire",
			},
		},
		required: ["memoryText"],
	},
};

export const getMemorySchema = {
	name: "getMemory",
	description: "Retrieve all stored memories as a single string",
	parameters: {
		type: "object",
		properties: {},
	},
};

export const callFrenchAgentSchema = {
	name: "callFrenchAgent",
	description: "This is a function to call a French agent that can translate text to French.",
	parameters: {
		type: "object",
		properties: {
			message: {
				type: "string",
				description: "The message (only the text to translate) to send to the French agent",
			},
		},
		required: ["message"],
	},
};

export const callFrenchExpertSchema = {
	name: "callFrenchExpert",
	description: "This is a function to call a French expert that can provide interesting random facts about french art and literature.",
	parameters: {
		type: "object",
		properties: {
			message: {
				type: "string",
				description: "What the users original query was.",
			},
		},
		required: ["message"],
	},
};

export const callEnglishAgentSchema = {
	name: "callEnglishAgent",
	description: "This is a function to call a English agent that can translate text to English.",
	parameters: {
		type: "object",
		properties: {
			message: {
				type: "string",
				description: "The message (only the text to translate) to send to the English agent",
			},
		},
		required: ["message"],
	},
};