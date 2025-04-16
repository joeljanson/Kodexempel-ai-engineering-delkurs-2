// ------------------------------------------------------------
// Search for embeddings in Supabase
/*
CREATE OR REPLACE FUNCTION public.similarity_search(
    query_embedding vector(384),
    max_num_results integer,
    score_threshold float
) RETURNS TABLE(embedding_id bigint, text text, score float) AS $$
BEGIN
    RETURN QUERY
    SELECT embeddings.id, embeddings.text, (1 - (embeddings.embedding <=> query_embedding)) AS score
    FROM embeddings
    WHERE (1 - (embeddings.embedding <=> query_embedding)) > score_threshold
    ORDER BY score DESC
    LIMIT max_num_results;
END;
$$ LANGUAGE plpgsql;
*/
// ------------------------------------------------------------

const dotenv = require("dotenv");

dotenv.config();
const { InferenceClient } = require("@huggingface/inference");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

const client = new InferenceClient(process.env.HF_TOKEN);

const { OpenAI } = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

async function performSimilaritySearch(
	queryEmbedding,
	maxResults = 5,
	scoreThreshold = 0.5
) {
	const { data, error } = await supabase.rpc("similarity_search", {
		query_embedding: queryEmbedding,
		max_num_results: maxResults,
		score_threshold: scoreThreshold,
	});

	if (error) {
		console.error("Error performing similarity search:", error);
		return [];
	}

	return data;
}

async function generateEmbedding(text, prefix = "") {
	const inputs = prefix + " " + text;
	console.log(inputs);
	const embedding = await client.featureExtraction({
		model: "intfloat/multilingual-e5-large-instruct",
		inputs: inputs,
		provider: "hf-inference",
	});

	return embedding;
}

async function getAnswerFromLLM(query, context) {
	const prompt = `User question: ${query}
    Context: ${context}`;

	//	console.log(prompt);

	const chatCompletion = await client.chatCompletion({
		provider: "hf-inference",
		model: "mistralai/Mistral-7B-Instruct-v0.3",
		messages: [
			{
				role: "system",
				content: `You are a helpful assistant working at Zalando that can answer questions based on the provided context.
                If you don't know the answer, just say "I don't know".
                Do not mention any references to the context such as "Based on the context provided" or "According to the context".
                Or references to different sections mentioned in the context.
                Also be very brief but friendly in your answers.
                Answer in the language of the question.
                `,
			},
			{
				role: "user",
				content: prompt,
			},
		],
	});

	return chatCompletion.choices[0].message;
}

async function getAnswerFromOpenAI(query, context) {
	const prompt = `User question: ${query}
    Context: ${context}`;

	const response = await openai.responses.create({
		model: "gpt-4o",
		input: [
			{
				role: "system",
				content: `You are a helpful assistant working at Zalando that can answer questions based on the provided context.
                If you don't know the answer, just say "I don't know".
                Do not mention any references to the context such as "Based on the context provided" or "According to the context".
                Or references to different sections mentioned in the context.
                Also be very brief but friendly in your answers.
                Answer in the language of the question.
                `,
			},
			{
				role: "user",
				content: prompt,
			},
		],
	});

	//console.log(response.output_text);
	return response.output_text;
}

async function main() {
	const query = "Hur lång tid har jag på mig att returnera en vara?";
	const embedding = await generateEmbedding(query, "query: ");
	const results = await performSimilaritySearch(embedding, 2);
	console.log(results);
	const resultsText = [];
	for (const result of results) {
		resultsText.push(result.text);
	}
	const openAIanswer = await getAnswerFromOpenAI(query, resultsText);
	const answer = await getAnswerFromLLM(query, resultsText);
	console.log("openAIanswer: ", openAIanswer);
	console.log("answer: ", answer);
}

main();
