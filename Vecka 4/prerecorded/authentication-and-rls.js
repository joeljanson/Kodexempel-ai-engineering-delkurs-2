/*

Detta är den SQL kod som skapar tabellen todos.

create table todos (
  id serial primary key,
  task text,
  is_done boolean default false
);

Detta är den sql kod som lägger till en kolumn user_id i tabellen todos.

alter table todos add column user_id uuid references auth.users(id);

Detta är koden som skapar Row level security policy för tabellen todos.

-- Enable RLS
alter table todos enable row level security;

-- Create policy for inserting todos
create policy "Users can insert their own todos"
on todos for insert
with check (auth.uid() = user_id);

-- Create policy for selecting todos
create policy "Users can view their own todos"
on todos for select
using (auth.uid() = user_id);

-- Create policy for updating todos
create policy "Users can update their own todos"
on todos for update
using (auth.uid() = user_id);

-- Create policy for deleting todos
create policy "Users can delete their own todos"
on todos for delete
using (auth.uid() = user_id);


*/

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addTodo(task) {
	const { data, error } = await supabase
		.from("todos")
		.insert({ task })
		.select();
	if (error) {
		console.error(error);
	}
	console.log(data);
	return data;
}

async function getTodos() {
	const { data, error } = await supabase.from("todos").select("*");
	if (error) {
		console.error(error);
	}
	console.log(data);
	return data;
}

//addTodo('Learn about authentication and RLS again');
//getTodos();

async function signUpUser(email, password) {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) {
		console.error(error);
	} else {
		console.log("User created successfully");
	}
	return data;
}

async function signInUser(email, password) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});
	if (error) {
		console.error(error);
	} else {
		console.log("User signed in successfully");
	}
	return data;
}

async function signOutUser() {
	const { error } = await supabase.auth.signOut();
	if (error) {
		console.error(error);
	} else {
		console.log("User signed out successfully");
	}
}

async function addUserTodo(task, user_id) {
	const { data, error } = await supabase
		.from("todos")
		.insert([{ task, user_id }])
		.select();
	if (error) {
		console.error(error);
	}
	return data;
}

async function runAuthExamples() {
	const user = "test@test.com";
	const password = "test123";

	//signUpUser(user, password);
    await getTodos();
	const session = await signInUser(user, password);
	await addUserTodo("Test sign out function", session.user.id);
	await getTodos();
	await signOutUser();
    await getTodos();
	//await getTodos();
}

runAuthExamples();
