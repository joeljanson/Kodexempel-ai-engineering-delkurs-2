const dotenv = require("dotenv");
dotenv.config();

const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

async function generateEmbeddingsWithBGE(texts) {
    console.log("Generating embedding with BGE...");
    const embeddings = await client.featureExtraction({
			model: "BAAI/bge-m3",
			inputs: texts,
		});
    //console.log(embeddings);
    //console.log("Embedding generated successfully. Embedding length: ", embeddings[0].length);
    //console.log(embeddings.length);

    const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
    console.log("Similarity: ", similarity);

    return embeddings;
}

//generateEmbeddingsWithBGE(["Today is a beautiful day", "I don't like pizza"])
generateEmbeddingsWithBGE([
	"Pierre Boulez (26 March 1925 – 5 January 2016) was a French composer and conductor. He was one of the dominant figures of post-war contemporary classical music. As a composer, he played a leading role in the development of integral serialism in the 1950s, and the electronic transformation of instrumental music in real time from the 1970s. Boulez conducted many of the world's great orchestras, including the Vienna Philharmonic and the London Symphony Orchestra. In the 1970s, he was the music director of the New York Philharmonic and the chief conductor of the BBC Symphony Orchestra. He was particularly known for his performances of 20th-century music, including Debussy, Stravinsky and Schoenberg. Boulez's work in opera included the Jahrhundertring, a production of Wagner's Ring cycle for the centenary of the Bayreuth Festival.",
	"Vem var Pierre Boulez?",
]);
//generateEmbeddingsWithBGE(["Idag är en vacker dag", "Jag gillar inte pizza"])

function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}



