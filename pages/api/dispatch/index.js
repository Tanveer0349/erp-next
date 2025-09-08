import { connectDB } from "@/lib/db";
import DispatchOrder from "@/models/DispatchOrder";
import Product from "@/models/Product";
import Joi from "joi";

// 🔹 Joi schema
const orderSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product is required",
    "string.empty": "Product is required",
  }),
  quantity: Joi.number().integer().positive().required().messages({
    "any.required": "Quantity is required",
    "number.base": "Quantity must be a number",
    "number.positive": "Quantity must be greater than 0",
  }),
  clientName: Joi.string().min(2).max(50).required().messages({
    "any.required": "Client name is required",
    "string.empty": "Client name is required",
    "string.min": "Client name must be at least 2 characters",
    "string.max": "Client name must not exceed 50 characters",
  }),
});

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const orders = await DispatchOrder.find({ status: "pending" }).populate("productId");
      const formattedOrders = orders.map((o) => ({
        _id: o._id,
        productName: o.productId.name,
        quantity: o.quantity,
        clientName: o.clientName,
        status: o.status,
      }));
      return res.status(200).json(formattedOrders);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch dispatch orders" });
    }
  }

  if (req.method === "POST") {
    try {
      // 🔹 Validate inputs
      const { error, value } = orderSchema.validate(req.body, { abortEarly: true });
      if (error) {
        return res.status(400).json({
          error: error.details.map((d) => d.message),
        });
      }

      const { productId, quantity, clientName } = value;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: ["Product not found"] });
      if (quantity > product.quantity) {
        return res.status(400).json({ error: ["Quantity exceeds available stock"] });
      }

      const order = await DispatchOrder.create({
        productId,
        quantity,
        clientName,
        status: "pending",
      });

      return res.status(201).json(order);
    } catch (err) {
      return res.status(500).json({ error: ["Server error, please try again later"] });
    }
  }

  return res.status(405).json({ error: ["Method not allowed"] });
}
