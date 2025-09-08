import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "@/styles/dispatchReport.module.css";

export default function DispatchReport() {
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    fetchRecords();
  }, [startDate, endDate, page]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/reports/dispatch", {
        params: { startDate, endDate, page },
      });
      setRecords(res.data.records || []);
      setTotalPages(res.data.totalPages || 1);
      
      // Calculate summary statistics
      const total = res.data.records?.length || 0;
      const pending = res.data.records?.filter(r => r.status === 'pending').length || 0;
      const completed = res.data.records?.filter(r => r.status === 'fulfilled').length || 0;
      setSummary({ total, pending, completed });
    } catch (err) {
      console.error("Error fetching dispatch report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Report title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Dispatch Report", 14, 20);
    
    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date Range: ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`, 14, 30);
    
    // Summary
    doc.setFontSize(10);
    doc.text(`Total Orders: ${summary.total} | Pending: ${summary.pending} | Completed: ${summary.completed}`, 14, 40);
    
    // Table data
    const tableColumn = ["Product", "Quantity", "Client", "Status", "Created Date"];
    const tableRows = records.map((r) => [
      r.product?.name || "N/A",
      `${r.quantity} ${r.product?.unit || ""}`,
      r.clientName,
      r.status.toUpperCase(),
      new Date(r.createdAt).toLocaleDateString(),
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
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
    
    doc.save(`dispatch-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return styles.statusPending;
      case "processing": return styles.statusProcessing;
      case "completed": return styles.statusCompleted;
      case "cancelled": return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dispatch Report</h1>
        <p className={styles.subtitle}>Track and analyze dispatch order activities</p>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <h2 className={styles.filtersTitle}>Report Filters</h2>
        <div className={styles.filtersGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <button
            onClick={downloadPDF}
            className={styles.downloadButton}
            disabled={records.length === 0}
          >
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{summary.total}</div>
          <div className={styles.summaryLabel}>Total Orders</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{summary.pending}</div>
          <div className={styles.summaryLabel}>Pending</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{summary.completed}</div>
          <div className={styles.summaryLabel}>Completed</div>
        </div>
      </div>

      {/* Report Table */}
      <div className={styles.reportCard}>
        <div className={styles.reportHeader}>
          Dispatch Records ({records.length})
        </div>
        
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>⏳</div>
            <p className={styles.emptyStateText}>Loading dispatch records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📦</div>
            <p className={styles.emptyStateText}>No dispatch records found for selected date range</p>
          </div>
        ) : (
          <>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.product?.name || "N/A"}</td>
                    <td className={styles.quantityCell}>
                      {record.quantity} {record.product?.unit || ""}
                    </td>
                    <td className={styles.clientCell}>{record.clientName}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(record.createdAt).toLocaleDateString()}
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