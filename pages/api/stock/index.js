import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import Stock from "@/models/Stock";

export default async function handler(req, res) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const stock = await Stock.find().populate("product");
      return res.json(stock);
    }

    if (req.method === "POST") {
      const { product, department, qty } = req.body;
      let record = await Stock.findOne({ product, department });

      if (!record) {
        record = await Stock.create({ product, department, qty });
        return res.status(201).json({
          message: "Stock has been added successfully",
          record,
        });
      } else {
        record.qty += qty;
        await record.save();
        return res.status(200).json({
          message: "Stock has been updated successfully",
          record,
        });
      }
    }

    if (req.method === "PUT") {
      const { product, department, qty, action } = req.body;

      let record = await Stock.findOne({ product, department });
      if (!record)
        return res.status(404).json({ message: "Stock record not found" });

      if (action === "remove") {
        if (record.qty < qty) {
          return res
            .status(400)
            .json({ message: "Insufficient stock to remove" });
        }
        record.qty -= qty;
        await record.save();
        return res.status(200).json({
          message: "Stock has been removed successfully",
          record,
        });
      }

      return res.status(400).json({ message: "Invalid action" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Stock API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
