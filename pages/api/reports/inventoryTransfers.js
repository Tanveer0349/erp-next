// pages/api/reports/inventoryTransfers.js
import { connectDB } from "@/lib/db";
import TransferRecord from "@/models/TransferRecord";

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

      query.transferredAt = { $gte: fromDate, $lte: toDate };
    } else {
      // ✅ Default to today's range
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      query.transferredAt = { $gte: today, $lte: endOfDay };
    }

    const records = await TransferRecord.find(query)
      .populate("product")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ transferredAt: -1 });

    const total = await TransferRecord.countDocuments(query);

    return res.json({
      records,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching inventory transfers:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
