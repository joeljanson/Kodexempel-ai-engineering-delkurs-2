import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const hf = new InferenceClient(process.env.HF_ACCESS_TOKEN);

const MODEL = "mistralai/Mistral-7B-Instruct-v0.3";//"Qwen/Qwen2.5-72B-Instruct";
const PROVIDER = "hf-inference";


const schema = {
    type: "object",
    properties: {
        location: { type: "string"},
        activity: { type: "string"},
        numberOfAnimalsSeen: { type: "integer", minimum: 1},
        animalNames: { type: "array", items: { type: "string" } }
    },
    required: ["location", "activity", "numberOfAnimalsSeen", "animalNames"],
    additionalProperties: false
}


async function runStructuredOutput() {
    const messages = [
        {
            role:"system",
            content: "You are a helpful assistant that extracts structured information from text. In your response, be a bit poetic in each field."
        },
        {
            role: "user",
            content: "I saw a puppy, a cat and a raccoon during my bike ride in the park."
        }
    ];

    const response = await hf.chatCompletion({
        model: MODEL,
        provider: PROVIDER,
        messages,
        response_format: { type: "json", value: schema}
    })

    const parsed = JSON.parse(response.choices[0].message.content);
    const { location, activity, numberOfAnimalsSeen, animalNames } = parsed;

    console.log(`Location: ${location}`);
    console.log(`Activity: ${activity}`);
    console.log(`Number of animals seen: ${numberOfAnimalsSeen}`);
    console.log(`Animal names: ${animalNames.join(", ")}`);

}

runStructuredOutput();

