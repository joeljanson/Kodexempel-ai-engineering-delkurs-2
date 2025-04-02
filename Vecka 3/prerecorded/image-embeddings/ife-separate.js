const {
	AutoProcessor,
	AutoTokenizer,
	CLIPTextModelWithProjection,
	CLIPVisionModelWithProjection,
	RawImage,
} = require("@huggingface/transformers");

/**
 * The Embedder class provides methods to embed text and images using the CLIP model.
 */
class Embedder {
	constructor() {
		this.modelId = "Xenova/clip-vit-base-patch16"; // Pretrained CLIP model identifier
		this.tokenizer = null; // Will hold the tokenizer for text inputs
		this.textModel = null; // Will hold the CLIP text model
		this.processor = null; // Will process image inputs
		this.visionModel = null; // Will hold the CLIP vision model
	}

	/**
	 * Initializes the Embedder by loading the tokenizer and models.
	 */
	async init() {
		// Load tokenizer (used to convert text to token IDs)
		if (!this.tokenizer) {
			this.tokenizer = await AutoTokenizer.from_pretrained(this.modelId);
		}

		// Load the CLIP text model with projection head for embeddings
		if (!this.textModel) {
			this.textModel = await CLIPTextModelWithProjection.from_pretrained(
				this.modelId,
				{
					quantized: false, // Set to true if you want a smaller, faster version
				}
			);
		}

		// Load processor (used to preprocess images)
		if (!this.processor) {
			this.processor = await AutoProcessor.from_pretrained(this.modelId);
		}

		// Load the CLIP vision model with projection head
		if (!this.visionModel) {
			this.visionModel = await CLIPVisionModelWithProjection.from_pretrained(
				this.modelId,
				{
					quantized: false,
				}
			);
		}
	}

	/**
	 * Embeds the given text and returns the query embedding.
	 * @param {string} text - The text to embed.
	 * @returns {Promise<Array>} The query embedding as an array.
	 * @throws {Error} If there is an error in embedding the text.
	 */
	async embed(text) {
		try {
			// Ensure models and tokenizer are loaded
			if (!this.tokenizer || !this.textModel) {
				await this.init();
			}

			// Tokenize the input text
			// - padding: true → ensures all tokenized inputs have the same length by adding padding tokens
			// - truncation: true → if text is too long, truncate it to fit the model's max length
			let text_inputs = this.tokenizer(text, {
				padding: true,
				truncation: true,
			});

			// Pass the tokenized input to the model to get embeddings
			const { text_embeds } = await this.textModel(text_inputs);

			// Convert the tensor to a regular JavaScript array and return the first (and only) vector
			const query_embedding = text_embeds.tolist()[0];
			return query_embedding;
		} catch (error) {
			throw new Error("Error in embedding text: " + error);
		}
	}

	/**
	 * Embeds the image from the given URL and returns the image embedding.
	 * @param {string} url - The URL of the image to embed.
	 * @returns {Promise<Array>} The image embedding as an array.
	 * @throws {Error} If there is an error in embedding the image or no image URL is provided.
	 */
	async embedImage(url) {
		if (!url) {
			throw new Error("No image url provided");
		}

		try {
			// Ensure models and processor are loaded
			if (!this.processor || !this.visionModel) {
				await this.init();
			}

			// Load the image from the provided URL into a RawImage object
			const rawImage = await RawImage.read(url);

			// Preprocess the image using the AutoProcessor (resize, normalize, etc.)
			let image_inputs = await this.processor(rawImage);

			// Pass the processed image to the vision model to get embeddings
			const { image_embeds } = await this.visionModel(image_inputs);

			// Convert the tensor to a regular JS array and return the first vector
			const imageVector = image_embeds.tolist()[0] || [];
			return imageVector;
		} catch (error) {
			throw new Error("Error in embedding image: " + error);
		}
	}
}

// Create and export an instance of the Embedder class
const embedder = new Embedder();
module.exports = { embedder };
