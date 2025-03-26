const { pipeline } = require("@huggingface/transformers");

async function main() {
	// Create depth estimation pipeline
	const depth_estimator = await pipeline(
		"depth-estimation",
		"onnx-community/depth-anything-v2-small"
	);

	// Predict depth of an image
	const url =
		"images/image.jpg";
	const { depth } = await depth_estimator(url);

	// Visualize the output
	depth.save("depth.png");
}

main();
