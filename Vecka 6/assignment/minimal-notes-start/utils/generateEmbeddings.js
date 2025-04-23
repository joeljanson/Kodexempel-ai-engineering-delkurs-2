/**
 * Naïve splitter: breaks long text into ~chunkSize character chunks,
 * attempting to split on sentence boundaries.
 */

import { pipeline } from "@huggingface/transformers";

export async function generateSingleEmbedding(text, prefix = "") {
	/* 
    Implementera en embedding modell från Hugging Face.
    Förslagsvis: Supabase/gte-small
    För tydliga instruktioner se: https://huggingface.co/Supabase/gte-small#:~:text=Use%20within%20Node.js%20or%20a%20web%20bundler%20(Webpack%2C%20etc)%3A
    Byt ut @xenova/transformers med @huggingface/transformers
    Om ni väljer en annan modell, kom ihåg att byta
    ut storleken på er vector i supabase-tabellen.
    */

    const embedding = ["placeholder-embedding"];
	return embedding;
}
