import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

export async function storeInSupabase({ note, embedding }) {
	/*
    Implementera en funktion som lägger in en post i tabellen notes i supabase.
    Se nedan för exempel på hur tabellen är skapad.
    Inget behöver returneras från denna funktion.
    */
}

export async function querySupabase({
	embedding,
	maxResults = 5,
	threshold = 0.5,
}) {
	/*
    Implementera en funktion som söker i tabellen notes i supabase.
    Se SQL nedan för hur den sökfunktionen bör implementeras i SQL.
    Använd sedan supabase.rpc för att anropa denna sökfunktion.
    Se: https://supabase.com/docs/reference/javascript/rpc
    */
}

/*

------------------ SQL --------------------

!!!! VIKTIGT ATT ANPASSA VECTOR STORLEKEN I TABELLEN OCH I FUNCTIONEN !!!!

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
