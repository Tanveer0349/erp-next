import { useRouter } from "next/router";

export default function ProductionPanel() {
  const router = useRouter();

  const actions = [
    {
      name: "Production Work Orders",
      path: "/workorders",
      desc: "Create, monitor, and manage production work orders.",
      onClick: () => router.push("/workorders"),
    },
    {
      name: "Production Stock",
      path: "/stock",
      desc: "View and manage stock for the production department.",
      onClick: () => router.push("/stock?department=production"),
    },
     {
      name: "Inventory Transfer Report",
      path: "/reports/inventoryTransfers",
      desc: "Track inventory movement between departments.",
            onClick: () => router.push('/reports/inventoryTransfers')

    },
        {
      name: "Work Orders Report",
      path: "/reports/workorders",
      desc: "Monitor work order history and completion details.",
      onClick: () => router.push('/reports/workorders')

    }
  ];

  return (
    <div className="p-6 border rounded-lg shadow mt-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Production</h2>
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
