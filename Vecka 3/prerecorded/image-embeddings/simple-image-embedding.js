const { pipeline } = require("@huggingface/transformers");
const fs = require("fs");
const path = require("path");

/*




*/

async function generateImageEmbedding(imagePath) {
    console.log("Preparing image embedding...");
    const imageEmbeddingExtractor = await pipeline(
			"image-feature-extraction",
			"Xenova/clip-vit-base-patch16"
		);
    const imageEmbedding = await imageEmbeddingExtractor(imagePath);
    const embedding = Array.from(imageEmbedding.data);
    console.log("Image embedding generated successfully.");
    //console.log(embedding);
    //console.log(embedding.length);

    return embedding;
}

async function run() {
    const imageEmbedding = await generateImageEmbedding(path.join(__dirname, "images", "city2.jpg"));
    const secondImageEmbedding = await generateImageEmbedding(path.join(__dirname, "images", "city4.jpg"));
    const similarity = cosineSimilarity(imageEmbedding, secondImageEmbedding);
    console.log("Similarity: ", similarity);
}

run();



function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}