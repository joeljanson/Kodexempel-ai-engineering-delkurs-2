import { Agent } from "./gemini-agent.js";
//import { addToMemorySchema, getMemorySchema, callFrenchAgentSchema } from "./functions.js";
import { OpenAIAgent } from "./openai-agent.js";
import {
	addToMemorySchema,
	getMemorySchema,
	callFrenchAgentSchema,
	callEnglishAgentSchema,
} from "./openai-function-declarations.js";
import readline from 'readline';

//callMemoryAgentScema -> this agent is responsible for adding to memory and getting memory.
// If the user says something that seems to be important, call this agent who will handle all of the memory.

const superVisorAgent = new OpenAIAgent({
	systemInstructions: `You are a helpful assistant that can answer questions and help with tasks. 
            Always answer in Swedish. 
            Call any functions you need to, don't ask for more information or permission.
            When you have called a function, always answer the users original question politely and explanatory. Feel free to add extra context that any tool call results in.`,
            model: "gpt-4o-mini",
	tools: [addToMemorySchema, getMemorySchema, callFrenchAgentSchema, callEnglishAgentSchema],
});

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to handle the chat
async function chat() {
    rl.question('Du: ', async (input) => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
            console.log(JSON.stringify(superVisorAgent.history, null, 2));
            console.log('Hejdå!');
            rl.close();
            return;
        }

        try {
            const response = await superVisorAgent.chat(input);
            console.log('\nAgent:', response);
            console.log('\n-------------------\n');
            chat(); // Continue the conversation
        } catch (error) {
            console.error('Ett fel uppstod:', error);
            chat(); // Continue even if there's an error
        }
    });
}

// Start the chat
console.log('Välkommen till chatten! Skriv "exit" eller "quit" för att avsluta.\n');
chat();












/* 
const agent = new Agent({
	systemInstructions: [
		{
			text: `You are a helpful assistant that can answer questions and help with tasks. 
            Always answer in Swedish. 
            Call any functions you need to, don't ask for more information or permission.
            When you have called a function, always answer the users original question politely and explanatory.`,
		},
	],
	tools: [addToMemorySchema, getMemorySchema, callFrenchAgentSchema],
});

// Then use it like:
const response = await agent.chat("Could you translate the following text to french: 'Hello, My name is Joel' and then add it to my memory.");
console.log(response); */