import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

export async function storeInSupabase({ note, embedding }) {
	// Assuming embeddingsAndChunks is an array of objects like { chunk: text-chunk, embedding: [embedding] }

	// Step 1: Insert the note into the 'notes' table
	const { data: noteData, error: noteError } = await supabase
		.from("notes")
		.insert([{ content: note, embedding: embedding }])
		.single()
		.select();

	if (noteError) {
		console.error("Error inserting note:", noteError);
		return;
	}

	console.log("Successfully inserted note:", noteData);
}

export async function querySupabase({
	embedding,
	maxResults = 5,
	threshold = 0.5,
}) {
	/* TODO: similarity search via pgvector in Supabase */
	const { data, error } = await supabase.rpc("similarity_search", {
		query_embedding: embedding,
		max_num_results: maxResults,
		score_threshold: threshold,
	});

	if (error) {
		console.error("Error performing similarity search:", error);
		return [];
	}

	return data;
}

/*

------------------ SQL --------------------

CREATE TABLE public.notes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    content text NOT NULL,
    embedding vector(384),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
) WITH (OIDS=FALSE);


---------------------- Explanation-----------------

notes Table: This table stores the complete notes with an auto-generated primary key id, a content field for the note text, and a created_at timestamp that is filled automatically.


----------------------------Search for embeddings in Supabase--------------------------------


CREATE OR REPLACE FUNCTION public.similarity_search(
    query_embedding vector(384),
    max_num_results integer,
    score_threshold float
) RETURNS TABLE(embedding_id bigint, text text, score float, created_at timestamp with time zone) AS $$
BEGIN
    RETURN QUERY
    SELECT notes.id, notes.content, (1 - (notes.embedding <=> query_embedding)) AS score, notes.created_at
    FROM notes
    WHERE (1 - (notes.embedding <=> query_embedding)) > score_threshold
    ORDER BY score DESC
    LIMIT max_num_results;
END;
$$ LANGUAGE plpgsql;

*/
