import { useRouter } from "next/router";
import styles from "@/styles/reports.module.css";

export default function ReportsPage() {
  const router = useRouter();

  const reports = [
    {
      name: "Inventory Transfer Report",
      path: "/reports/inventoryTransfers",
      desc: "Track inventory movement between departments with detailed transfer history, including quantities, timestamps, and responsible personnel.",
      icon: "📦"
    },
    {
      name: "Dispatch Report",
      path: "/reports/dispatch",
      desc: "View and analyze dispatch order activities, including client information, shipment status, and delivery timelines.",
      icon: "🚚"
    },
    {
      name: "Work Orders Report",
      path: "/reports/workorders",
      desc: "Monitor work order history, completion details, production efficiency metrics, and resource allocation analysis.",
      icon: "📋"
    }
  ];

 

  const handleReportClick = (path) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports & Analytics</h1>
        <p className={styles.subtitle}>Access detailed insights and performance metrics</p>
      </div>

     
      {/* Reports Grid */}
      <div className={styles.reportsGrid}>
        {reports.map((report, index) => (
          <div
            key={report.name}
            onClick={() => handleReportClick(report.path)}
            className={styles.reportCard}
          >
            <div className={styles.reportIcon}>
              {report.icon}
            </div>
            <h3 className={styles.reportName}>{report.name}</h3>
            <p className={styles.reportDesc}>{report.desc}</p>
            <div className={styles.reportAction}>
              View Report
              <span className={styles.arrowIcon}>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Reports Section */}
      
    </div>
  );
}