import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
