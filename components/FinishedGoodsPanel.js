import { useRouter } from "next/router";

export default function FinishedGoodsPanel() {
  const router = useRouter();

  const actions = [
    {
      name: "View Finished Goods Stock",
      path: "/stock",
      desc: "Check current finished goods quantities.",
      onClick: () => router.push("/stock?department=finished"),
    },
    {
      name: "Dispatch Orders",
      path: "/dispatch",
      desc: "Manage and dispatch finished goods orders.",
      onClick: () => router.push("/dispatch"),
    },
     {
      name: "Dispatch Report",
      path: "/reports/dispatch",
      desc: "View and analyze dispatch order activities.",
            onClick: () => router.push("/reports/dispatch"),

    }
  ];

  return (
    <div className="p-6 border rounded-lg shadow mt-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Finished Goods</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <div
            key={action.name}
            onClick={action.onClick}
            className="cursor-pointer p-4 border rounded-lg shadow hover:shadow-md hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-blue-600">{action.name}</h3>
            <p className="text-sm text-gray-600">{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
