const { embedder } = require("./ife-separate");
const fs = require("fs");
const path = require("path");

async function main() {
	// Example texts to embed
	const texts = [
		"a photo of a car",
		"a dog lying in the grass",
		"a dog",
		"a cat",
		"a city",
		"a tree",
		"paris",
		"new york",
		"stockholm",
	];

	// Example image paths
	const images = [
		"images/hund.png",
		"images/hund2.jpg",
		"images/hund3.jpg",
		"images/hund4.jpg",
		"images/cat.jpg",
		"images/cat2.jpg",
		"images/cat3.jpg",
		"images/city.jpg",
		"images/city2.jpg",
		"images/city3.jpg",
		"images/city4.jpg",
		"images/city5.jpg",
		"images/city6.jpg",
		"images/tree.jpg",
		"images/tree2.jpg",
		"images/tree3.jpg",
	];

	try {
		// Initialize the embedder
		await embedder.init();

		// Process texts in batch
		console.log("Processing text embeddings...");
		const textEmbeddings = await Promise.all(
			texts.map((text) => embedder.embed(text))
		);

		// Process images in batch
		console.log("Processing image embeddings...");
		const imageEmbeddings = await Promise.all(
			images.map((image) => embedder.embedImage(image))
		);

		// Store image embeddings
		await storeImageEmbeddings(images, imageEmbeddings);
		await storeTextEmbeddings(texts, textEmbeddings);

		// Compare embeddings using cosine similarity
		/* for (let i = 0; i < texts.length; i++) {
			for (let j = 0; j < images.length; j++) {
				const similarity = cosineSimilarity(
					textEmbeddings[i],
					imageEmbeddings[j]
				);
				console.log(
					`Similarity between "${texts[i]}" and image ${j + 1}: ${similarity}`
				);
			}
		} */
	} catch (error) {
		console.error("Error:", error);
	}
}

function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}

// Store image embeddings with their metadata
async function storeImageEmbeddings(imagePaths, embeddings) {
	const embeddingsArray = embeddings;
	const metadata = imagePaths.map((path, index) => ({
		path,
		embedding: embeddingsArray[index],
	}));

	// Create embeddings directory if it doesn't exist
	const embeddingsDir = path.join(__dirname, "embeddings-xenova");
	if (!fs.existsSync(embeddingsDir)) {
		fs.mkdirSync(embeddingsDir);
	}

	// Store metadata and embeddings
	fs.writeFileSync(
		path.join(embeddingsDir, "image-embeddings.json"),
		JSON.stringify(metadata)
	);
	console.log(`Stored ${imagePaths.length} image embeddings`);
	return metadata;
}

async function storeTextEmbeddings(textPaths, embeddings) {
	const embeddingsArray = embeddings;
	const metadata = textPaths.map((path, index) => ({
		path,
		embedding: embeddingsArray[index],
	}));

	// Create embeddings directory if it doesn't exist
	const embeddingsDir = path.join(__dirname, "embeddings-xenova");
	if (!fs.existsSync(embeddingsDir)) {
		fs.mkdirSync(embeddingsDir);
	}

	// Store metadata and embeddings
	fs.writeFileSync(
		path.join(embeddingsDir, "text-embeddings.json"),
		JSON.stringify(metadata)
	);
	console.log(`Stored ${textPaths.length} text embeddings`);
	return metadata;
}

main();
