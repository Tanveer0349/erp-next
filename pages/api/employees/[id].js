import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    const employee = await Employee.findById(id).select("-password");
    if (!employee) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(employee);
  }

  if (req.method === "PUT") {
    try {
      const { password, ...rest } = req.body;
      let updateData = { ...rest };

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updated = await Employee.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password");

      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await Employee.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
