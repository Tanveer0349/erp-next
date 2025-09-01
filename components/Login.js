import { useRouter } from "next/router";
import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { validate } from "@/validation/login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = validate({ email, password });
    if (error) {
      setError(error.details[0].message);
      return;
    }

    setError("");

    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      login(data.token, data.user);
      router.push("/tasks");
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Oops! Your email or password is incorrect. Please try again.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
<div className="h-screen w-screen flex items-start justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-4 pt-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl"
      >
        {/* Title */}
        <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back 👋
        </h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium shadow">
            {error}
          </div>
        )}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Enter your password"
          className="border border-gray-300 p-3 w-full mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition"
        >
          Login
        </button>

        {/* Register Redirect */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
