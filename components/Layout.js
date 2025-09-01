import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function Layout({ children }) {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 shadow-lg px-8 py-4 flex justify-between items-center rounded-b-2xl">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-white tracking-wide hover:scale-105 transform transition"
        >
          Task<span className="text-yellow-300">Manager</span>
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-4">
          {!user && (
            <>
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-white text-blue-700 font-semibold shadow-md hover:bg-yellow-300 hover:text-black transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold shadow-md hover:bg-white hover:text-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* User + Logout */}
        {user && (
          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-white font-bold text-lg drop-shadow-md">
              Hello, {user.name} 👋
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-full shadow-lg transition"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        {/* {user && (
          // <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-8">
          //   🎉 Welcome back, {user.name}!
          // </h1>
        )} */}
        {children}
      </main>
    </div>
  );
}
