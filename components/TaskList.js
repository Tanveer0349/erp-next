import { useState, useEffect } from "react";
import axios from "axios";

export default function TaskList({ token }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const fetchTasks = async () => {
    const { data } = await axios.get("/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/tasks",
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      fetchTasks();
    } catch (err) {
      console.log(err);
      setTitle("");
    }
  };

  const deleteTask = async (id) => {
    await axios.delete(`/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex flex-col items-center px-4 py-10">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-6 text-center">
        ✨ Your Tasks
      </h1>

      {/* Task Form */}
      <form
        onSubmit={addTask}
        className="flex w-full max-w-lg bg-white rounded-xl shadow-md overflow-hidden"
      >
        <input
          type="text"
          placeholder="Add a new task..."
          className="flex-grow p-3 text-gray-700 focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 font-semibold hover:opacity-90 transition"
        >
          Add
        </button>
      </form>

      {/* Task List */}
      <ul className="mt-6 w-full max-w-lg space-y-2">
        {tasks.map((task) => (
          <li
            key={task._id}
            className="flex justify-between items-center bg-white/90 rounded-lg px-4 py-2 hover:bg-white transition"
          >
            <span className="text-gray-800 font-medium">{task.title}</span>
            <button
              onClick={() => deleteTask(task._id)}
              className="text-red-500 font-bold hover:scale-110 transition"
              aria-label="Delete task"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {tasks.length === 0 && (
        <p className="mt-6 text-white/90 text-lg italic">
          🎉 No tasks yet. Add your first one!
        </p>
      )}
    </div>
  );
}
