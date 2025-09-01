"use client"; // only if using App Router

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
      {/* Tagline */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-6 drop-shadow-lg">
        "Organize Today, Conquer Tomorrow 🚀"
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-center mb-10 max-w-2xl">
        Stay productive and in control with your personalized Task Manager.
      </p>

      {/* Buttons */}
      <div className="flex gap-6">
        <Link href="/login">
          <button className="px-6 py-3 rounded-2xl bg-white text-indigo-700 font-semibold shadow-lg hover:scale-105 transition">
            Login
          </button>
        </Link>

        <Link href="/register">
          <button className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-semibold shadow-lg hover:scale-105 transition">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}
