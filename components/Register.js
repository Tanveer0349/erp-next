import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { validate } from "@/validation/register";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = validate({ name, email, password });
    if (error) {
      setError(error.details[0].message);
      return;
    }

    setError("");
    try {
      await axios.post("/api/auth/register", { name, email, password });
      router.push("/login");
    } catch (err) {
      console.log(err);
      const errorMsg = err?.response?.data?.message || "Registration Failed!";
      setError(errorMsg);
    }
  };

  return (
    <div className="h-screen w-screen flex items-start justify-center bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600 px-4 pt-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl"
      >
        {/* Title */}
        <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Create Account ✨
        </h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium shadow">
            {error}
          </div>
        )}

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter your name"
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Create a password"
          className="border border-gray-300 p-3 w-full mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition"
        >
          Register
        </button>

        {/* Login Redirect */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
