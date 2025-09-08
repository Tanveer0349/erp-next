// /pages/api/dispatch/[id]/cancel.js
import { connectDB } from "@/lib/db";
import DispatchOrder from "@/models/DispatchOrder";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    // Find the order
    const order = await DispatchOrder.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    // Delete the order instead of marking it cancelled
    await DispatchOrder.findByIdAndDelete(id);

    return res.status(200).json({ message: "Order deleted (cancelled) successfully" });
  } catch (err) {
    console.error("Cancel API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
