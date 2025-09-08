// /pages/api/dispatch/[id]/process.js
import { connectDB } from "@/lib/db";
import DispatchOrder from "@/models/DispatchOrder";
import Stock from "@/models/Stock";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    // Find the order
    const order = await DispatchOrder.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be processed" });
    }

    // Find stock record for this product in finished goods
    const stockItem = await Stock.findOne({
      product: order.productId,
      department: "finished",
    });

    if (!stockItem) {
      return res.status(400).json({ message: "Stock not found for this product" });
    }

    if (stockItem.qty < order.quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Deduct the dispatched quantity
    stockItem.qty -= order.quantity;
    await stockItem.save();

    // Update order status
    order.status = "fulfilled";
    order.processedAt = new Date();
    await order.save();

    return res.json(order);
  } catch (err) {
    console.error("Error processing dispatch order:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
