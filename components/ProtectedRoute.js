// components/ProtectedRoute.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // Skip check on login page
    if (router.pathname === "/login") return;

    if (!token || !user) {
      router.push("/");
    }
  }, [router]);

  return <>{children}</>;
}
