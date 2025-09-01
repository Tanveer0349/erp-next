import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/authMiddleware";

export default async function handler(req, res) {
  await connectDB();

  try {
    const userId = verifyToken(req);

    if (req.method === "GET") {
      const tasks = await Task.find({ user: userId });
      return res.json(tasks);
    }

    if (req.method === "POST") {
      const { title } = req.body;
      const task = new Task({ title, user: userId });
      await task.save();
      return res.status(201).json(task);
    }

    res.status(405).end();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}
