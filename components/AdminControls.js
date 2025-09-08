import { useRouter } from "next/router";

export default function AdminControls() {
  const router = useRouter();

  const actions = [
    {
      name: "Manage Products",
      path: "/products",
      desc: "Add, edit, and delete products.",
    },
    {
      name: "Manage Stock",
      path: "/stock",
      desc: "Track and adjust raw/finished stock.",
    },
    {
      name: "Work Orders",
      path: "/workorders",
      desc: "Create and monitor work orders.",
    },
    {
      name: "Manage Employees",
      path: "/employees",
      desc: "Add or assign employees.",
    },
    {
      name: "Inventory Transfers",
      path: "/receipts",
      desc: "Transfer stock between departments.",
    },
    {
      name: "Reports",
      path: "/reports",
      desc: "Generate performance and stock reports.",
    },
  ];

  return (
    <div className="p-6 border rounded-lg shadow mt-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <div
            key={action.name}
            onClick={() => router.push(action.path)}
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
