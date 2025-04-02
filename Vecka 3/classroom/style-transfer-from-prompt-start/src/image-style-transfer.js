import { Client } from "@gradio/client";

const imageClient = await Client.connect("multimodalart/flux-style-shaping", {
	hf_token: import.meta.env.VITE_HUGGINGFACE_API_TOKEN,
});

export async function imageTransform(structureFile, styleFile, prompt) {
	const readAsBlob = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const byteArray = Uint8Array.from(
					atob(reader.result.split(",")[1]),
					(c) => c.charCodeAt(0)
				);
				resolve(new Blob([byteArray]));
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});

	try {
		// Convert files to Blobs
		const structureBlob = await readAsBlob(structureFile);
		const styleBlob = await readAsBlob(styleFile);

		// Make the prediction request
		const result = await imageClient.predict("/generate_image", {
			prompt,
			structure_image: structureBlob,
			style_image: styleBlob,
			depth_strength: 15,
			style_strength: 0.5,
		});

		// Extract and return the image URL
		const fileUrl = result.data[0]?.url;
		if (!fileUrl) {
			throw new Error("No valid image URL found in the response.");
		}

		return fileUrl; // Return the image file URL for display in the <img> tag
	} catch (error) {
		console.error("Error during image transformation:", error);
		throw error;
	}
}
