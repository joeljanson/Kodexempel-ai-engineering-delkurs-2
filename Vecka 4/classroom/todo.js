/*


id
created_at
due_date
task
is_done

*/

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY
);

async function addTodo(task, due_date) {
	const { data, error } = await supabase
		.from("todos")
		.insert({
			task,
			due_date,
		})
		.select();
	if (error) {
		console.error(error);
	} else {
		console.log(data);
		console.log("Todo added successfully");
	}
}

async function getTodos() {
	const { data, error } = await supabase.from("todos").select("*");
	if (error) {
		console.error(error);
	} else {
		console.log(data);
	}
}

async function markTodoAsDone(id) {
	const { data, error } = await supabase
		.from("todos")
		.update({ is_done: true })
		.eq("id", id);
	if (error) {
		console.error(error);
	} else {
		console.log(data);
		console.log("Todo marked as done");
	}
}

async function toggleTodo(id) {
	const { data: todo, error: fetchError } = await supabase
		.from("todos")
		.select("is_done")
		.eq("id", id)
		.single();
	if (fetchError) {
		console.error(fetchError);
	} else {
		const { data, error } = await supabase
			.from("todos")
			.update({ is_done: !todo.is_done })
			.eq("id", id);
		if (error) {
			console.error(error);
		} else {
			console.log(data);
			console.log("Todo toggled");
		}
	}
}

//addTodo("Test our supabase setup", "2025-04-10");
//getTodos();
//markTodoAsDone(1);
toggleTodo(1);
