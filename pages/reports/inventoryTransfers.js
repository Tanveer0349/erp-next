import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "@/styles/inventoryReport.module.css";

export default function InventoryTransfersReport() {
  const today = new Date().toISOString().split("T")[0];
  const [transfers, setTransfers] = useState([]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/reports/inventoryTransfers", {
        params: { from: fromDate, to: toDate, page },
      });
      setTransfers(res.data.records || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching transfers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Report title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Inventory Transfer Report", 14, 20);
    
    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date Range: ${formatDateDisplay(fromDate)} to ${formatDateDisplay(toDate)}`, 14, 30);
    
    // Table data
    const tableColumn = ["Product", "From", "To", "Quantity", "Date"];
    const tableRows = transfers.map((r) => [
      r.product?.name || "N/A",
      getDepartmentName(r.fromDepartment),
      getDepartmentName(r.toDepartment),
      `${r.qty} ${r.product?.unit || ""}`,
      new Date(r.transferredAt).toLocaleDateString(),
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    doc.save(`inventory-transfer-report-${today}.pdf`);
  };

  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDepartmentName = (dept) => {
    switch (dept) {
      case "raw": return "Raw Materials";
      case "production": return "Production";
      case "finished": return "Finished Goods";
      default: return dept;
    }
  };

  const getDepartmentClass = (dept) => {
    switch (dept) {
      case "raw": return styles.departmentRaw;
      case "production": return styles.departmentProduction;
      case "finished": return styles.departmentFinished;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventory Transfer Report</h1>
        <p className={styles.subtitle}>Track and analyze inventory movements between departments</p>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <h2 className={styles.filtersTitle}>Report Filters</h2>
        <div className={styles.filtersGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <button
            onClick={downloadPDF}
            className={styles.downloadButton}
            disabled={transfers.length === 0}
          >
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className={styles.reportCard}>
        <div className={styles.reportHeader}>
          Transfer Records ({transfers.length})
        </div>
        
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>⏳</div>
            <p className={styles.emptyStateText}>Loading transfers...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📊</div>
            <p className={styles.emptyStateText}>No transfers found for selected date range</p>
          </div>
        ) : (
          <>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>From Department</th>
                  <th>To Department</th>
                  <th>Quantity</th>
                  <th>Transfer Date</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer._id}>
                    <td>{transfer.product?.name || "N/A"}</td>
                    <td>
                      <span className={`${styles.departmentBadge} ${getDepartmentClass(transfer.fromDepartment)}`}>
                        {getDepartmentName(transfer.fromDepartment)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.departmentBadge} ${getDepartmentClass(transfer.toDepartment)}`}>
                        {getDepartmentName(transfer.toDepartment)}
                      </span>
                    </td>
                    <td className={styles.quantityCell}>
                      {transfer.qty} {transfer.product?.unit || ""}
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(transfer.transferredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                
                <span className={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </span>
                
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}