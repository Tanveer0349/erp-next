// models/WorkOrder.js
import mongoose from "mongoose";
import Product from "@/models/Product";

const WorkOrderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true },
    status: { type: String, enum: ["open", "cancelled", "fulfilled"], default: "open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.WorkOrder || mongoose.model("WorkOrder", WorkOrderSchema);
