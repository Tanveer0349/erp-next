import { useRouter } from "next/router";

export default function RawMaterialPanel() {
  const router = useRouter();

  const actions = [
    {
      name: "View Raw Material Stock",
      path: "/stock",
      desc: "Check current raw material quantities.",
      onClick: () => router.push("/stock?department=raw"),
    },
    {
      name: "Inventory Transfers",
      path: "/receipts",
      desc: "Transfer stock between departments.",
      onClick: () => router.push("/receipts"),
    },
     {
      name: "Inventory Transfer Report",
      path: "/reports/inventoryTransfers",
      desc: "Track inventory movement between departments.",
      onClick: () => router.push('/reports/inventoryTransfers')
    }

  ];

  return (
    <div className="p-6 border rounded-lg shadow mt-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Raw Material Store</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
