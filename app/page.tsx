"use client";

import { useEffect, useState } from "react";
import _ from "lodash";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const URL = "https://jsonplaceholder.typicode.com";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>();

  useEffect(() => {
    async function fetchData() {
      const todos = await fetchTodos();
      setTodos(todos);
    }
    fetchData();
  }, []);

  async function fetchTodos(): Promise<Todo[]> {
    const response = await fetch(`${URL}/todos`);
    return await response.json();
  }

  async function handleClick(todo: Todo) {
    const idx = todos!.findIndex((t) => t.id === todo.id);
    const newState = [...todos!];
    newState.splice(idx, 1, { ...todo, completed: !todo.completed });
    setTodos(newState);
    const response = await fetch(`${URL}/todos/${todo.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed: !todo.completed,
      }),
    });
    return await response.json();
  }

  async function handleCreate() {
    const response = await fetch(`${URL}/todos`, {
      method: "POST",
      body: JSON.stringify({
        title: "",
      }),
    });
    const json = await response.json();

    const newTodo: Todo = {
      id: json.id,
      title: "",
      completed: false,
    };
    const newState = [newTodo, ...todos!];
    setTodos(newState);
  }

  const debouncedTitleChange = _.debounce(
    async (newTitle: string, todo: Todo) => {
      await fetch(`${URL}/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      const idx = todos!.findIndex((t) => t.id === todo.id);
      const newState = [...todos!];
      newState.splice(idx, 1, { ...todo, title: newTitle });
      setTodos(newState);
    },
    500
  );

  async function handleTitleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    todo: Todo
  ) {
    debouncedTitleChange(e.target.value, todo);
  }

  async function handleDelete(todo: Todo) {
    const idx = todos!.findIndex((t) => t.id === todo.id);
    const newState = [...todos!];
    newState.splice(idx, 1);
    setTodos(newState);
    await fetch(`${URL}/todos/${todo.id}`, {
      method: "DELETE",
    });
  }

  async function addTenThousandTodos() {
    const newTodos: Todo[] = [];
    for (let i = 0; i < 10000; i++) {
      newTodos.push({ id: 1000 + i, title: `to do ${i}`, completed: false });
    }
    setTodos([...newTodos, ...todos!]);
  }

  if (!todos) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Next.js TODO</h1>
      {todos && (
        <div>
          <button onClick={handleCreate}>Create New To Do</button>
          <button onClick={addTenThousandTodos}>Add 10,000 To Dos</button>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleClick(todo)}
                />{" "}
                <input
                  type="text"
                  defaultValue={todo.title}
                  onChange={(e) => handleTitleChange(e, todo)}
                />
                <button onClick={() => handleDelete(todo)}>delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
