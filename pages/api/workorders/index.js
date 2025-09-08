import { connectDB } from "@/lib/db";
import WorkOrder from "@/models/WorkOrder";
import Product from "@/models/Product";
import Employee from "@/models/Employee";
import Stock from "@/models/Stock";
import Joi from "joi";

// Joi Schema
const workOrderSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product is required",
    "string.empty": "Product must be selected",
  }),
  qty: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required",
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
  }),
  createdBy: Joi.string().required().messages({
    "any.required": "Creator ID is required",
  }),
});

export default async function handler(req, res) {
  await connectDB();

  try {
    // ✅ Preview BOM requirements
    if (req.method === "GET" && req.query.preview === "true") {
      const { productId, qty = 1 } = req.query;

      const product = await Product.findById(productId).populate("recipe.rawProduct");
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.category !== "finished") {
        return res.status(400).json({ message: "Preview only available for finished products" });
      }

      const materials = await Promise.all(
        product.recipe.map(async (item) => {
          const needed = item.qty * qty;
          const stockRecord = await Stock.findOne({
            product: item.rawProduct._id,
            department: "production", // assume materials always come from raw store
          });
          const available = stockRecord ? stockRecord.qty : 0;
          const shortage = needed > available ? needed - available : 0;

          return {
            id: item.rawProduct._id,
            name: item.rawProduct.name,
            unit: item.rawProduct.unit,
            needed,
            available,
            shortage,
          };
        })
      );

      return res.json({ product: product.name, qty, materials });
    }

    // ✅ Fetch workorders
    if (req.method === "GET") {
      const { page = 1, limit = 10 } = req.query;
      const query = { status: "open" };

      const skip = (page - 1) * limit;

      const workorders = await WorkOrder.find(query)
        .populate("product")
        .populate("createdBy", "name email department")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await WorkOrder.countDocuments(query);

      return res.json({
        records: workorders,
        totalPages: Math.ceil(total / limit),
      });
    }

    // ✅ Create workorder
    if (req.method === "POST") {
      const { error, value } = workOrderSchema.validate(req.body, { abortEarly: false });

      if (error) {
        return res.status(400).json({
          errors: error.details.map((err) => err.message),
        });
      }

      const { productId, qty, createdBy } = value;
      const product = await Product.findById(productId);

      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.category !== "finished") {
        return res.status(400).json({ message: "WorkOrders can only be created for finished goods" });
      }

      const newWO = await WorkOrder.create({
        product: productId,
        qty,
        createdBy,
        status: "open",
      });

      return res.status(201).json(newWO);
    }

    return res.status(405).end();
  } catch (err) {
    console.error("WorkOrder API Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
