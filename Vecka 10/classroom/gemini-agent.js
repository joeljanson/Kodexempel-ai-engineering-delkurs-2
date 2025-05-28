import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { addToMemory, getMemory, callFrenchAgent } from "./gemini-function-declarations.js";

dotenv.config();

export class Agent {
    constructor({
        systemInstructions = "",
        model = "gemini-2.0-flash",
        tools = [],
        apiKey = process.env.GEMINI_API_KEY
    }) {
        this.ai = new GoogleGenAI({ apiKey });
        this.model = model;
        this.history = [];
        this.config = {
            systemInstruction: [systemInstructions],
            responseMimeType: "text/plain",
            ...(tools.length > 0 && { tools: [{ functionDeclarations: tools }] })
        };
    }

    async chat(message) {
        // Add user message to history
        this.history.push({
            role: "user",
            parts: [{ text: message }]
        });

        return await this._runFullTurn();
    }

    async _runFullTurn() {
        let iterations = 0;
        const maxIterations = 5;

        while (iterations < maxIterations) {
            iterations++;
            
            // Get model completion
            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: this.history,
                config: this.config
            });

            const assistantMessage = response.candidates[0].content;
            this.history.push(assistantMessage);

            const functionParts = assistantMessage.parts.filter((p) => p.functionCall);
            if (functionParts.length === 0) {
                return assistantMessage.parts[0].text;
            }

            // Handle function calls
            for (const part of functionParts) {
                const { name, args } = part.functionCall;
                
                // Handle function calls here
                let result;
                if (name === "addToMemory") {
                    result = await addToMemory(args.memoryText, args.expires);
                    console.log("Called add to memory:", result);
                } else if (name === "getMemory") {
                    result = getMemory();
                    console.log("Called get memory:", result);
                } else if (name === "callFrenchAgent") {
                    result = await callFrenchAgent(args.message);
                    console.log("Called call french agent:", result);
                } else {
                    console.warn(`⚠️  Unknown tool call: ${name}`);
                    result = `Error: no handler for ${name}`;
                }

                const functionResponsePart = {
                    name: name,
                    response: { result }
                };

                // Add function call and response to history
                this.history.push({
                    role: "model",
                    parts: [{ functionCall: part.functionCall }]
                });

                this.history.push({
                    role: "user",
                    parts: [{ functionResponse: functionResponsePart }]
                });
            }
        }
    }
}

// Example usage:
/*
const agent = new Agent({
    systemInstructions: [{
        text: "You are a helpful assistant that can answer questions and help with tasks. Always answer in Swedish."
    }],
    tools: [addToMemorySchema, getMemorySchema]
});

// Then use it like:
const response = await agent.chat("My name is Joel?");
console.log(response);
*/
