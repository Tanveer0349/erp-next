
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Joi from "joi";

const recipeItem = Joi.object({
  rawProduct: Joi.string().required().messages({
    "any.required": "Raw product is required",
    "string.empty": "Raw product is required",
  }),
  qty: Joi.number().greater(0).required().messages({
    "number.base": "Qty must be a number",
    "number.min": "Qty must be at least 1",
    "any.required": "Qty is required",
  }),
});

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  sku: Joi.string().alphanum().min(2).max(50).required().messages({
    "string.empty": "SKU is required",
    "string.alphanum": "SKU must be alphanumeric",
  }),
  category: Joi.string().valid("raw", "finished").required().messages({
    "any.only": "Category must be either 'raw' or 'finished'",
    "string.empty": "Category is required",
  }),
  unit: Joi.string().default("pcs"),
  lowStockThreshold: Joi.number().min(0).default(0),
  recipe: Joi.alternatives().conditional("category", {
    is: "finished",
    then: Joi.array().min(1).items(recipeItem).required().messages({
      "array.min": "Finished product must have at least one recipe item",
    }),
    otherwise: Joi.any().strip(),
  }),
});

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const product = await Product.findById(id).populate("recipe.rawProduct", "name sku unit");
      if (!product) return res.status(404).json({ message: "Not found" });
      return res.status(200).json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const existing = await Product.findById(id);
      if (!existing) return res.status(404).json({ message: "Not found" });

      // Merge existing + incoming so we validate the final shape (important if 'category' isn't sent)
      const merged = { ...existing.toObject(), ...req.body };

      const { error, value } = productSchema.validate(merged, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          message: "Validation failed - Try again",
          errors: error.details.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      // If SKU was changed ensure uniqueness
      if (value.sku && value.sku !== existing.sku) {
        const dup = await Product.findOne({ sku: value.sku });
        if (dup) {
          return res.status(400).json({
            message: "SKU must be unique",
            errors: [{ path: "sku", message: "SKU must be unique" }],
          });
        }
      }

      const updated = await Product.findByIdAndUpdate(id, value, { new: true })
        .populate("recipe.rawProduct", "name sku unit");

      return res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
