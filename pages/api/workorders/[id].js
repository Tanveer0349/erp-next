import { connectDB } from "@/lib/db";
import WorkOrder from "@/models/WorkOrder";
import Product from "@/models/Product";
import Stock from "@/models/Stock";

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  try {
    // Populate the main product
    const wo = await WorkOrder.findById(id).populate("product");

    if (!wo) return res.status(404).json({ message: "WorkOrder not found" });

    // ✅ Cancel workorder
    if (req.method === "PUT") {
      if (req.query.cancel) {
        await WorkOrder.findByIdAndDelete(id);
        return res.json({ message: "WorkOrder cancelled and deleted" });
      }

      if (wo.status === "fulfilled") {
        return res.status(400).json({ message: "Already fulfilled" });
      }

      // ✅ Populate raw products in the recipe manually
      for (let i = 0; i < wo.product.recipe.length; i++) {
        const rawId = wo.product.recipe[i].rawProduct;
        const rawProduct = await Product.findById(rawId);
        wo.product.recipe[i].rawProduct = rawProduct;
      }

      // ✅ Deduct raw materials from 'production' stock
      for (const item of wo.product.recipe) {
        const rawStock = await Stock.findOne({
          product: item.rawProduct._id,
          department: "production",
        });

        if (!rawStock || rawStock.qty < item.qty * wo.qty) {
          return res.status(400).json({
            message: `Not enough stock for ${item.rawProduct.name}`,
          });
        }

        rawStock.qty -= item.qty * wo.qty;
        await rawStock.save();
      }

      // ✅ Add finished goods to 'finished' stock
      const finishedStock = await Stock.findOne({
        product: wo.product._id,
        department: "finished",
      });

      if (finishedStock) {
        finishedStock.qty += wo.qty;
        await finishedStock.save();
      } else {
        await Stock.create({
          product: wo.product._id,
          department: "finished",
          qty: wo.qty,
        });
      }

      wo.status = "fulfilled";
      await wo.save();

      return res.json({ message: "WorkOrder fulfilled", workorder: wo });
    }

    return res.status(405).end();
  } catch (err) {
    console.error("WorkOrder API Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
