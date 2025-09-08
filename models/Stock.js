// models/Stock.js
import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    department: { type: String, enum: ["raw", "production", "finished"], required: true },
    qty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Stock || mongoose.model("Stock", StockSchema);
