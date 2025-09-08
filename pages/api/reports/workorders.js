// pages/api/reports/workorders.js
import { connectDB } from "@/lib/db";
import WorkOrder from "@/models/WorkOrder";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    let { from, to, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (from && to) {
      // ✅ Use provided range
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: fromDate, $lte: toDate };
    } else {
      // ✅ Default to today's range
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: today, $lte: endOfDay };
    }

    const records = await WorkOrder.find(query)
      .populate("product")
      .populate("createdBy")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
      console.log("recodrs",records);

    const total = await WorkOrder.countDocuments(query);

    return res.json({
      records,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching workorders:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
