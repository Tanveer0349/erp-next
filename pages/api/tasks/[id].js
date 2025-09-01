import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/authMiddleware";

export default async function handler(req, res) {
  await connectDB();

  try {
    const userId = verifyToken(req);

    if (req.method === "DELETE") {
      await Task.findOneAndDelete({ _id: req.query.id, user: userId });
      return res.json({ message: "Task deleted" });
    }

    res.status(405).end();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}
