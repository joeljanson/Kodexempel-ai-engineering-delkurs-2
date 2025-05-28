import { Type } from "@google/genai";

export const addToMemorySchema = {
	name: "addToMemory",
	description:
		"When the user tells you something factual about themselves, their life, or their preferences, call this function. Keep the memoryText short and concise.",
	parameters: {
		type: Type.OBJECT,
		properties: {
			memoryText: {
				type: Type.STRING,
				description: "Text to add to the memory bank",
			},
			expires: {
				type: Type.BOOLEAN,
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
		type: Type.OBJECT,
		properties: {},
	},
};
