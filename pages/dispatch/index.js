import { useState, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/dispatch.module.css";

export default function DispatchOrdersPanel() {
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newOrder, setNewOrder] = useState({
    productId: "",
    quantity: "",
    clientName: "",
  });

  // Fetch finished goods stock and dispatch orders
  useEffect(() => {
    fetchStock();
    fetchOrders();
  }, []);

  const fetchStock = async () => {
    try {
      const { data } = await axios.get("/api/stock");
      const finishedStock = data.filter((s) => s.department === "finished");
      setStock(finishedStock);
    } catch (err) {
      console.error("Error fetching stock:", err);
      setError("Failed to load stock data");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/dispatch");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    }
  };

  // Handle input changes (clear error on input)
  const handleInputChange = (field, value) => {
    setNewOrder({ ...newOrder, [field]: value });
    setError("");
  };

  // Create new dispatch order
  const handleCreateOrder = async () => {
    setError("");
    const { productId, quantity, clientName } = newOrder;

    // Validation
    if (!productId || !quantity || !clientName) {
      setError("Please fill all fields");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/dispatch", { productId, quantity, clientName });
      setNewOrder({ productId: "", quantity: "", clientName: "" });
      fetchOrders();
      fetchStock();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Process dispatch order
  const handleProcess = async (orderId) => {
    try {
      await axios.put(`/api/dispatch/${orderId}/process`);
      fetchOrders();
      fetchStock();
    } catch (err)  {
      if (err.response?.data) {
        setError(err.response.data.message);
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  // Cancel dispatch order
  const handleCancel = async (orderId) => {
    try {
      await axios.put(`/api/dispatch/${orderId}/cancel`);
      fetchOrders();
      fetchStock();
    } catch (err) {
      if (err.response?.data) {
        setError(err.response.data.message);
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  // Get available stock for selected product
  const selectedStock = stock.find((s) => s.product._id === newOrder.productId) || null;

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "pending": return styles.statusPending;
      case "processed": return styles.statusProcessed;
      case "cancelled": return styles.statusCancelled;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dispatch Orders</h1>
      </div>

      {/* Error box */}
      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Create Order */}
      <div className={styles.createOrderCard}>
        <h3 className={styles.createOrderTitle}>Create New Dispatch Order</h3>

        <div className={styles.formGrid}>
          {/* Product */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product</label>
            <select
              value={newOrder.productId}
              onChange={(e) => handleInputChange("productId", e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select Product</option>
              {stock.map((s) => (
                <option key={s._id} value={s.product._id}>
                  {s.product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={newOrder.quantity}
              onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
              className={styles.formInput}
              min="1"
            />
          </div>

          {/* Available stock */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Available Stock</label>
            <div className={styles.stockDisplay}>
              {selectedStock ? selectedStock.qty : "-"}
            </div>
          </div>

          {/* Client */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Client Name</label>
            <input
              type="text"
              placeholder="Enter client name"
              value={newOrder.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              className={styles.formInput}
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className={styles.createButton}
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.ordersTable}>
        {orders.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Product</th>
                <th>Quantity</th>
                <th>Client</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.productName}</td>
                  <td>{o.quantity}</td>
                  <td>{o.clientName}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {o.status === "pending" && (
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleProcess(o._id)}
                          className={`${styles.actionButton} ${styles.processButton}`}
                        >
                          Process
                        </button>
                        <button
                          onClick={() => handleCancel(o._id)}
                          className={`${styles.actionButton} ${styles.cancelButton}`}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📦</div>
            <p className={styles.emptyStateText}>No dispatch orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}