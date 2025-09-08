
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
  // Conditional: when category === 'finished' require recipe array; otherwise strip it
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

  if (req.method === "GET") {
    try {
      const products = await Product.find().lean();
      return res.status(200).json(products);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch products" });
    }
  }

  if (req.method === "POST") {
    try {
      // Validate request body (collect all errors)
      const { error, value } = productSchema.validate(req.body, {
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

      // Check for duplicate SKU
      const existing = await Product.findOne({ sku: value.sku });
      if (existing) {
        return res.status(400).json({
          message: "SKU must be unique",
          errors: [{ path: "sku", message: "SKU must be unique" }],
        });
      }

      const newProduct = await Product.create(value);
      return res.status(201).json(newProduct);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error: " + err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
