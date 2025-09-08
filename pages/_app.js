import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "../components/Layout";
import "@/styles/globals.css";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Pages where Layout should NOT be applied
  const excludeLayoutRoutes = ["/dashboard",'/'];

  // Check if current route should exclude layout
  const shouldExcludeLayout = excludeLayoutRoutes.includes(router.pathname);

  // If layout should be excluded, render component directly
  if (shouldExcludeLayout) {
    return (
      <ProtectedRoute>
        {" "}
        <Component {...pageProps} />
      </ProtectedRoute>
    );
  }

  // Otherwise, wrap with Layout
  return (
    <ProtectedRoute>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ProtectedRoute>
  );
}
