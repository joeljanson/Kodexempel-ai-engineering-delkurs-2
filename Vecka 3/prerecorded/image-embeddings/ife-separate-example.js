const { embedder } = require("./ife-separate");
const path = require("path");

async function run() {
    //const embedder = new Embedder();

    const text = "A kitten sitting on a bed";
    const imagePath = path.join(__dirname, "images", "tree.jpg");

    await embedder.init();

    const textEmbedding = await embedder.embed(text);
    const imageEmbedding = await embedder.embedImage(imagePath);

    const similarity = cosineSimilarity(textEmbedding, imageEmbedding);
    console.log("Similarity: ", similarity);
}

function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}

run();

