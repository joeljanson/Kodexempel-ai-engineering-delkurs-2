const dotenv = require("dotenv");
dotenv.config();

const { OpenAI } = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateEmbeddingWithOpenAI(text) {
    const embedding = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    //console.log(`Our embedding is: ${embedding.data[0].embedding}`);
    //console.log(`Our embedding length (dimension) is: ${embedding.data[0].embedding.length}`);
    return embedding.data[0].embedding;
}


async function run() {
	const firstEmbedding = await generateEmbeddingWithOpenAI(
		`Pierre Boulez (26 March 1925 – 5 January 2016) was a French composer and conductor. He was one of the dominant figures of post-war contemporary classical music. As a composer, he played a leading role in the development of integral serialism in the 1950s, and the electronic transformation of instrumental music in real time from the 1970s. Boulez conducted many of the world's great orchestras, including the Vienna Philharmonic and the London Symphony Orchestra. In the 1970s, he was the music director of the New York Philharmonic and the chief conductor of the BBC Symphony Orchestra. He was particularly known for his performances of 20th-century music, including Debussy, Stravinsky and Schoenberg. Boulez's work in opera included the Jahrhundertring, a production of Wagner's Ring cycle for the centenary of the Bayreuth Festival.`
	);
	const secondEmbedding = await generateEmbeddingWithOpenAI(
		`Hur gör man pizza?`
	);

	const similarity = cosineSimilarity(firstEmbedding, secondEmbedding);
	console.log(`The similarity between the two embeddings is: ${similarity}`);
}

run();

function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}