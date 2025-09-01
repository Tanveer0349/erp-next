import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TaskList from "@/components/TaskList";

export default function Tasks() {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
    } else {
      setToken(t);
    }
  }, [router]);

  return token ? <TaskList token={token} /> : null;
}
