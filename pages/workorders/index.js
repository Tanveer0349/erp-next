import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/workorders.module.css";

export default function WorkOrdersPage() {
  const [products, setProducts] = useState([]);
  const [workorders, setWorkorders] = useState([]);
  const [form, setForm] = useState({ productId: "", qty: 1 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 5;

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const prodRes = await axios.get("/api/products");
      setProducts(prodRes.data);

      const woRes = await axios.get("/api/workorders", { params: { page, limit } });
      setWorkorders(woRes.data.records || []);
      setTotalPages(woRes.data.totalPages || 1);
    } catch (err) {
      setError("Failed to load data");
      setTimeout(() => setError(""), 3000);
    }
  };

  useEffect(() => {
    if (form.productId && form.qty > 0) {
      fetchPreview(form.productId, form.qty);
    } else {
      setPreview(null);
    }
  }, [form.productId, form.qty]);

  const fetchPreview = async (productId, qty) => {
    try {
      const res = await axios.get("/api/workorders", {
        params: { preview: true, productId, qty },
      });
      setPreview(res.data);
    } catch (err) {
      setPreview(null);
    }
  };

  const createWorkOrder = async () => {
    if (!user?.id) {
      setError("No logged-in user found.");
      return;
    }

    if (preview?.materials?.some((m) => m.shortage > 0)) {
      setError("Insufficient raw materials for this work order.");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("/api/workorders", { ...form, createdBy: user.id });
      setForm({ productId: "", qty: 1 });
      setError("");
      setPreview(null);
      fetchData();
    } catch (err) {
      if (err.response?.data?.errors) setError(err.response.data.errors[0]);
      else if (err.response?.data?.message) setError(err.response.data.message);
      else setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const processWorkOrder = async (workOrderId) => {
    try {
      await axios.put(`/api/workorders/${workOrderId}`);
      fetchData();
        setSuccess('Workorder Fulfilled successfully !');
      setTimeout(() => setSuccess(""), 2000);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process work order");
      setTimeout(() => setError(""), 2000);
    }
  };

  const cancelWorkOrder = async (workOrderId) => {
    
    try {
      await axios.put(`/api/workorders/${workOrderId}?cancel=true`);
      fetchData();
      setSuccess('Workorder cancelled successfully !');
      setTimeout(() => setSuccess(""), 2000);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel work order");
      setTimeout(() => setError(""), 2000);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "open": return styles.statusPending;
      case "processing": return styles.statusProcessing;
      case "completed": return styles.statusCompleted;
      case "cancelled": return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  const hasShortage = preview?.materials?.some((m) => m.shortage > 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Work Orders</h1>
        <p className={styles.subtitle}>Create and manage production work orders</p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}
       {success && (
              <div className={styles.successBox}>
                {success}
              </div>
            )}

      {/* Create Work Order */}
      <div className={styles.createCard}>
        <h2 className={styles.createTitle}>Create New Work Order</h2>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product</label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className={`${styles.formSelect} ${error.toLowerCase().includes("product") ? styles.inputError : ''}`}
            >
              <option value="">Select Finished Product</option>
              {products.filter((p) => p.category === "finished").map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Quantity</label>
            <input
              type="number"
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
              className={`${styles.formInput} ${error.toLowerCase().includes("quantity") ? styles.inputError : ''}`}
              min="1"
            />
          </div>

          <button
            onClick={createWorkOrder}
            disabled={hasShortage || isLoading}
            className={styles.createButton}
          >
            {isLoading ? "Creating..." : "Create Order"}
          </button>
        </div>

        {/* BOM Preview */}
        {preview && (
          <div className={styles.previewSection}>
            <h3 className={styles.previewTitle}>
              Materials required for {preview.qty} × {preview.product}
            </h3>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Needed</th>
                  <th>Available</th>
                  <th>Shortage</th>
                </tr>
              </thead>
              <tbody>
                {preview.materials.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{parseFloat(m.needed?.toFixed(4))} {m.unit}</td>
                    <td>{parseFloat(m.available?.toFixed(4))} {m.unit}</td>
                    <td className={m.shortage > 0 ? styles.shortageWarning : ''}>
                      {m.shortage > 0 ? `${m.shortage} ⚠️` : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasShortage && (
              <p className={styles.shortageWarning} style={{marginTop: '12px'}}>
                ⚠️ Insufficient materials. Cannot create work order.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Existing Work Orders */}
      <div className={styles.ordersCard}>
        <div className={styles.ordersHeader}>
          Work Orders
        </div>
        
        {workorders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📋</div>
            <p className={styles.emptyStateText}>No work orders found</p>
          </div>
        ) : (
          <>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workorders.map((wo) => (
                  <tr key={wo._id}>
                    <td>{wo.product?.name}</td>
                    <td>{wo.qty}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(wo.status)}`}>
                        {wo.status}
                      </span>
                    </td>
                    <td>{wo.createdBy?.name || "Unknown"}</td>
                    <td>{new Date(wo.createdAt).toLocaleString()}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        {wo.status === "open" && (
                          <>
                            <button
                              onClick={() => processWorkOrder(wo._id)}
                              className={styles.processButton}
                            >
                             Process
                            </button>
                            <button
                              onClick={() => cancelWorkOrder(wo._id)}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {wo.status === "processing" && (
                          <span className={styles.statusText}>In Progress</span>
                        )}
                        {(wo.status === "completed" || wo.status === "cancelled") && (
                          <span className={styles.statusText}>Finalized</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                
                <span className={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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