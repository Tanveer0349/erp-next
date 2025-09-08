import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "@/styles/workordersReport.module.css";

export default function WorkOrdersReport() {
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    fetchRecords();
  }, [startDate, endDate, page]);

  const fetchRecords = async () => {
    try {
      if (!startDate || !endDate) return;
      setIsLoading(true);
      const res = await axios.get("/api/reports/workorders", {
        params: { from: startDate, to: endDate, page, limit },
      });

      const data = Array.isArray(res.data.records) ? res.data.records : res.data.records || [];
      setRecords(data);
      setTotalPages(res.data.totalPages || 1);
      
      // Calculate summary statistics
      const total = data.length;
      const pending = data.filter(r => r.status === 'pending' || r.status === 'open').length;
      
      const completed = data.filter(r => r.status === 'fulfilled').length;
      setSummary({ total, pending, completed });
    } catch (err) {
      console.error("Error fetching work orders:", err);
      setRecords([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      // Fetch ALL records ignoring pagination
      const res = await axios.get("/api/reports/workorders", {
        params: { from: startDate, to: endDate, page: 1, limit: 10000 },
      });

      const allRecords = Array.isArray(res.data.records) ? res.data.records : res.data.records || [];

      const doc = new jsPDF();
      
      // Report title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Work Orders Report", 14, 20);
      
      // Date range
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date Range: ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`, 14, 30);
      
      // Summary
      doc.setFontSize(10);
      doc.text(`Total Orders: ${allRecords.length} | Pending: ${allRecords.filter(r => r.status === 'pending' || r.status === 'OPEN').length} | Completed: ${allRecords.filter(r => r.status === 'completed').length}`, 14, 40);
      
      // Table data
      const tableColumn = ["Product", "Quantity", "Status", "Created By", "Created Date"];
      const tableRows = allRecords.map((r) => [
        r.product?.name || "N/A",
        `${r.qty} ${r.product?.unit || ""}`,
        r.status.toUpperCase(),
        r.createdBy?.name || "N/A",
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
      
      doc.save(`workorders-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "open":
        return styles.statusPending;
      case "processing":
        return styles.statusProcessing;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const handleDateChange = (setter) => (e) => {
    setPage(1);
    setter(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Work Orders Report</h1>
        <p className={styles.subtitle}>Monitor work order history and completion details</p>
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
              onChange={handleDateChange(setStartDate)}
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={handleDateChange(setEndDate)}
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
          Work Order Records ({records.length})
        </div>
        
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>⏳</div>
            <p className={styles.emptyStateText}>Loading work orders...</p>
          </div>
        ) : records.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📋</div>
            <p className={styles.emptyStateText}>No work orders found for selected date range</p>
          </div>
        ) : (
          <>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.product?.name || "N/A"}</td>
                    <td className={styles.quantityCell}>
                      {record.qty} {record.product?.unit || ""}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className={styles.creatorCell}>{record.createdBy?.name || "N/A"}</td>
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