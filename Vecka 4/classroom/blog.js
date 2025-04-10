require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

async function addAuthor(name) {
	const { data: author, error: authorError } = await supabase
		.from("authors")
		.insert({ name })
		.select()
		.single();
	if (authorError) {
		console.error(authorError);
	} else {
		console.log(author);
		console.log("Author added successfully");
		return author;
	}
}

async function addPostForAuthor(author_id, title, content) {
	const { data: post, error: postError } = await supabase
		.from("posts")
		.insert({ author_id, title, content })
		.select()
	if (postError) {
		console.error(postError);
	} else {
		console.log(post);
		console.log("Post added successfully");
		return post;
	}
}

async function fetchPostsWithAuthor() {
	const { data, error } = await supabase
		.from("posts")
		.select(`
        id, title,content,
        authors (name)
        `);
	if (error) {
		console.error(error);
	} else {
		console.log(data);
	}
}

async function searchPostsByContent(content) {
     const { data, error } = await supabase.from("posts").select(`
        id, title,content,
        authors (name)
        `).ilike("content", `%${content}%`);
	if (error) {
		console.error(error);
	} else {
		console.log(data);
	}
}

async function getPostsByAuthor(author_id) {
    const { data, error } = await supabase
		.from("posts")
		.select(`
        id, title,content,
        authors (name)
        `)
		.eq("author_id", author_id);
	if (error) {
		console.error(error);
	} else {
		console.log(data);
	}
}

//addAuthor("Jane Doe");
//addPostForAuthor(2, "Janes first post", "This is Janes first post");
//fetchPostsWithAuthor();
//getPostsByAuthor(2);
searchPostsByContent("first");
