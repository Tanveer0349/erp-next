import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Employee from '@/models/Employee';
import { connectDB } from '@/lib/db';


dotenv.config();


export default async function handler(req, res) {
  // 🔐 Simple protection with a secret token
  if (req.query.secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // connect to MongoDB Atlas
    await connectDB();

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(process.env.SEED_PASSWORD, saltRounds);

    // check if admin exists
    const existingAdmin = await Employee.findOne({ email: "admin@example.com" });
    if (!existingAdmin) {
      await Employee.create({
        name: "Super Admin",
        email: "superadmin@gmail.com",
        password: hashedPassword, 
        role: "admin",
        department:'raw'
      });
      return res.status(200).json({ message: "✅ Admin user created" });
    } else {
      return res.status(200).json({ message: "⚡ Admin already exists" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "❌ Error seeding DB", error: err.message });
  } finally {
    await mongoose.disconnect();
  }
}