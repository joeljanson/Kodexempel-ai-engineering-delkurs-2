import { Client } from "@gradio/client";

const imageClient = await Client.connect("multimodalart/flux-style-shaping");

export async function imageTransform(contentImage, styleImage, prompt) {
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
		const contentImageBlob = await readAsBlob(contentImage);
		const styleImageBlob = await readAsBlob(styleImage);

		const result = await imageClient.predict("/generate_image", {
			prompt: prompt,
			structure_image: contentImageBlob,
			style_image: styleImageBlob,
			depth_strength: 15,
			style_strength: 0.5,
		});

		console.log(result);

        const fileUrl = result.data[0]?.url;
        if (!fileUrl) {
            throw new Error("No valid image url");
        }

		return fileUrl;

	} catch (error) {
		console.error("Error reading image:", error);
		return null;
	}
}
