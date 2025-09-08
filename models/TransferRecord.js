// models/TransferRecord.js
import mongoose from "mongoose";
import Product from "@/models/Product";
const TransferRecordSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  fromDepartment: { type: String, required: true, enum: ["raw", "production", "finished"] },
  toDepartment: { type: String, required: true, enum: ["raw", "production", "finished"] },
  qty: { type: Number, required: true },
  transferredAt: { type: Date, default: Date.now },
});

export default mongoose.models.TransferRecord || mongoose.model("TransferRecord", TransferRecordSchema);
