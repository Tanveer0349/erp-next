// pages/api/transfer.js
import { connectDB } from "@/lib/db";
import Stock from "@/models/Stock";
import TransferRecord from "@/models/TransferRecord";
import Joi from "joi";

const transferSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product is required",
  }),
  fromDepartment: Joi.string().valid("raw", "production", "finished").required(),
  toDepartment: Joi.string().valid("raw", "production", "finished").required(),
  qty: Joi.number().greater(0).required().messages({
    "number.greater": "Quantity must be greater than 0",
  }),
  user: Joi.object().required(),
});

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { error, value } = transferSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const { productId, fromDepartment, toDepartment, qty, user } = value;

  if (fromDepartment === toDepartment) {
    return res.status(400).json({
      message: "Validation failed",
      errors: [{ path: "toDepartment", message: "Source and target must be different" }],
    });
  }

  if (user.role !== "admin" && user.department !== fromDepartment) {
    return res.status(403).json({
      message: "Permission denied",
      errors: [{ path: "fromDepartment", message: "You can only transfer from your own department" }],
    });
  }

  try {
    const sourceStock = await Stock.findOne({ product: productId, department: fromDepartment });
    if (!sourceStock || sourceStock.qty < qty) {
      return res.status(400).json({
        message: "Validation failed",
        errors: [{ path: "qty", message: `Not enough stock in ${fromDepartment} Material Stock` }],
      });
    }

    // Deduct from source
    sourceStock.qty -= qty;
    await sourceStock.save();

    // Add to target
    let targetStock = await Stock.findOne({ product: productId, department: toDepartment });
    if (targetStock) {
      targetStock.qty += qty;
    } else {
      targetStock = new Stock({ product: productId, department: toDepartment, qty });
    }
    await targetStock.save();

    await TransferRecord.create({
      product: productId,
      fromDepartment,
      toDepartment,
      qty,
      transferredBy: user?._id || null,
    });

    return res.status(201).json({ message: "Transfer successful" });
  } catch (err) {
    console.error("Transfer API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
