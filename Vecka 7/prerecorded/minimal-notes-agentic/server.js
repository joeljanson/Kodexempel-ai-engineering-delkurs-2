import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import { generateSingleEmbedding } from "./utils/generateEmbeddings.js";
import { storeInSupabase, querySupabase } from "./utils/supabaseUtils.js";
import { callLLM } from "./utils/llm.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ────────────────────────────────────────────────
// Static frontend
app.use(express.static(path.join(__dirname, "public")));


// POST /addNote  ────────────────────────────────
app.post("/addNote", async (req, res) => {
	const { note = "" } = req.body;
	if (!note.trim()) return res.status(400).json({ error: "note required" });

    const embedding = await generateSingleEmbedding(note);

	console.log("Embedding returned from generateSingleEmbedding: ", embedding);

	await storeInSupabase({ note, embedding });
	res.json({ ok: true });
});

// POST /queryNotes ──────────────────────────────
app.post("/queryNotes", async (req, res) => {
	const { query = "" } = req.body;
	if (!query.trim()) return res.status(400).json({ error: "query required" });

	const embedding = await generateSingleEmbedding(query);
	const matches = await querySupabase({ embedding, maxResults: 5, threshold: 0.5 });

	console.log("Matches returned from querySupabase: ", matches);

	res.json({ matches });
});

// POST /answerQuery ─────────────────────────────
app.post("/answerQuery", async (req, res) => {
	const { query = "" } = req.body;
    //console.log("Body: ", req.body);
	if (!query)
		return res.status(400).json({ error: "query required" });

	//console.log("Query: ", query);
	//console.log("Matches: ", matches);

	const answer = await callLLM({ query });
	res.json({ answer });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
