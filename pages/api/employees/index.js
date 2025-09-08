import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import bcrypt from "bcryptjs";
import Joi from "joi";

const employeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  department: Joi.string()
    .valid("raw", "production", "finished")
    .required()
    .messages({ "any.only": "Invalid department selected" }),
  role: Joi.string().valid("employee", "admin").required(),
});

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const employees = await Employee.find({}).select("-password");
    return res.status(200).json(employees);
  }

  if (req.method === "POST") {
    try {
      const { error, value } = employeeSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.details.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const { name, email, password, role, department } = value;

      // duplicate check
      const existing = await Employee.findOne({ email });
      if (existing) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [{ path: "email", message: "Email already exists" }],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const employee = new Employee({
        name,
        email,
        password: hashedPassword,
        role,
        department,
      });

      await employee.save();
      return res.status(201).json({
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
