import mongoose from "mongoose";

const DispatchOrderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  clientName: { type: String, required: true },
  status: { type: String, enum: ["pending", "fulfilled", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DispatchOrder || mongoose.model("DispatchOrder", DispatchOrderSchema);
