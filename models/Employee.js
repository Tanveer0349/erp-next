import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false }, // hashed password
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    department: {
      type: String,
      enum: ["raw", "production", "finished"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
