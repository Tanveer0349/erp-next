// pages/api/reports/dispatch.js
import { connectDB } from "@/lib/db";
import DispatchOrder from "@/models/DispatchOrder";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const query = { createdAt: { $gte: start, $lte: end } };

    const total = await DispatchOrder.countDocuments(query);
    const records = await DispatchOrder.find(query)
      .populate("productId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      records: records.map((r) => ({
        ...r.toObject(),
        product: r.productId,
      })),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Dispatch Report API error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
