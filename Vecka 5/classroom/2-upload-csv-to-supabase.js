// ------------------------------------------------------------
// Upload embeddings to Supabase
// ------------------------------------------------------------

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

const fs = require("fs");
const csv = require("csv-parser");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadEmbeddingsToSupabase() {
	const results = [];

	// Read the CSV file
	fs.createReadStream("embeddings.csv")
		.pipe(csv())
		.on("data", (data) => results.push(data))
		.on("end", async () => {
			try {
				// Format the data for Supabase
				const formattedData = results.map((row) => ({
					text: row.text,
					embedding: JSON.parse(row.embeddings),
				}));

				// Upload to Supabase
				const { data, error } = await supabase
					.from("embeddings")
					.insert(formattedData);

				if (error) {
					console.error("Error uploading to Supabase:", error);
				} else {
					console.log("Successfully uploaded embeddings to Supabase");
				}
			} catch (error) {
				console.error("Error processing data:", error);
			}
		});
}

// Execute the upload
uploadEmbeddingsToSupabase();
