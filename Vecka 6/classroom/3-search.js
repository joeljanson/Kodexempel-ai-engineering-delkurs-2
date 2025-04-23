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
const { pipeline } = require("@huggingface/transformers");
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
	const { data, error } = await supabase.rpc("similarity_search_embeddings", {
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
		model: "mixedbread-ai/mxbai-embed-large-v1",
		inputs: inputs,
		provider: "hf-inference",
	});

	return embedding;
}

async function generateEmbeddingsWithTransformerModel(text, prefix = "") {
	/*
    https://huggingface.co/Supabase/gte-small
    Limitation:
    This model exclusively caters to English texts, and any lengthy texts will be truncated to a maximum of 512 tokens.
    This model is not able to handle non-English texts. And we have to split our text so it's never longer than 512 tokens.
    Approximately 2000 characters
    */
   const extractor = await pipeline(
			"feature-extraction",
			"Xenova/multilingual-e5-large"
		);

		// Compute sentence embeddings
		const embeddings = await extractor([text], {
			pooling: "mean",
			normalize: true,
		});
		console.log(embeddings);
		// Tensor {
		//   dims: [ 2, 768 ],
		//   type: 'float32',
		//   data: Float32Array(1536) [ 0.019079938530921936, 0.041718777269124985, ... ],
		//   size: 1536
		// }

		console.log(embeddings.tolist());
		return embeddings[0].tolist();

}

async function getAnswerFromLLM(query, context) {
	const prompt = `User question: ${query}
    Context: ${context}`;

	//	console.log(prompt);

	const chatCompletion = await client.chatCompletion({
		provider: "nebius",
		model: "google/gemma-3-27b-it",
		messages: [
			{
				role: "system",
				content: [
					{
						type: "text",
						text: `You are a helpful assistant working at Zalando that can answer questions based on the provided context.
                If you don't know the answer, just say "I don't know".
                Do not mention any references to the context such as "Based on the context provided" or "According to the context".
                Or references to different sections mentioned in the context.
                Also be very brief but friendly in your answers.
                Answer in the language of the question.
                `,
					},
				],
			},
			{
				role: "user",
				content: [
					{
						type: "text",
						text: prompt,
					},
				],
			},
		],
	});

	return chatCompletion.choices[0].message;
}
async function rewriteSearchQuery(query) {
	
	const chatCompletion = await client.chatCompletion({
		provider: "nebius",
		model: "google/gemma-3-27b-it",
		messages: [
			{
				role: "system",
				content: [
					{
						type: "text",
						text: `Given a question, return a standalone question in the same language as the question.`,
					},
				],
			},
			{
				role: "user",
				content: [
					{
						type: "text",
						text: query,
					},
				],
			},
		],
	});

	return chatCompletion.choices[0].message.content;
}
async function getAnswerFromMistral(query, context) {
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
	const query = "I helgen var jag på ett museum i spanien och där så pratade jag med en kompis om roliga saker och annat, det fick mig att fundera. Hur lång tid har jag på mig att returnera en vara?";
	const rewrittenQuery = await rewriteSearchQuery(query);
	console.log("rewrittenQuery: ", rewrittenQuery);
	const embedding = await generateEmbeddingsWithTransformerModel(
		query
	);
	const results = await performSimilaritySearch(embedding, 2);
	console.log("Results are: ", results);
	const resultsText = [];
	for (const result of results) {
		resultsText.push(result.text);
	}
	const openAIanswer = await getAnswerFromOpenAI(query, resultsText);
	const answer = await getAnswerFromLLM(query, resultsText);
	const mistralAnswer = await getAnswerFromMistral(query, resultsText);
	console.log("openAIanswer: ", openAIanswer);
	console.log("answer: ", answer.content);
	console.log("mistralAnswer: ", mistralAnswer.content);
}

main();
