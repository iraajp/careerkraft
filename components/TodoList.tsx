import React, { useState, useEffect } from "react";
import { Todo } from "../types";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./Spinner";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://careerkraft.up.railway.app"
    : "http://localhost:3001";

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const { currentUser } = useAuth();

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/todos`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  };

  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newTodoTitle,
          description: newTodoDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to create todo");
      const newTodo = await response.json();
      setTodos((prev) => [...prev, newTodo]);
      setNewTodoTitle("");
      setNewTodoDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo");
    }
  };

  const updateTodoStatus = async (todoId: string, status: Todo["status"]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update todo");
      const updatedTodo = await response.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="w-full max-w-2xl bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-purple-300">Career Tasks</h2>

      {/* Add Todo Form */}
      <form onSubmit={createTodo} className="mb-6">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            placeholder="Task description (optional)"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-20"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 transition-all hover:border-purple-500"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-gray-400 mt-1">{todo.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={todo.status}
                  onChange={(e) =>
                    updateTodoStatus(todo.id, e.target.value as Todo["status"])
                  }
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-400 hover:text-red-300 focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {todos.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No tasks yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
};

export default TodoList;
