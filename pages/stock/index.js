import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/stock.module.css";

export default function StockPage() {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product: "",
    department: user?.role === "admin" ? "raw" : user?.department,
    qty: 0,
  });
  const [removeForm, setRemoveForm] = useState({
    product: "",
    department: user?.role === "admin" ? "raw" : user?.department,
    qty: 0,
  });
  const [filter, setFilter] = useState(
    user?.role === "admin" ? "all" : user?.department
  );

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stockRes = await axios.get("/api/stock");
      setStock(stockRes.data);

      const prodRes = await axios.get("/api/products");
      setProducts(prodRes.data);
    } catch (err) {
      setError("Failed to load data");
      setTimeout(() => setError(""), 3000);
    }
  };

  const addStock = async () => {
    if (!form.product) {
      setError('Please select a product');
      setTimeout(() => setError(""), 2000);
      return;
    } 
    if (form.qty <= 0) {
      setError('Please input a valid quantity');
      setTimeout(() => setError(""), 2000);
      return;
    } 
    
    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/stock", form);
      setSuccess(data.message);
      setError("");
      setForm({
        product: "",
        department: user.role === "admin" ? "raw" : user.department,
        qty: 0,
      });
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add stock");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const removeStock = async () => {
    if (!removeForm.product) {
      setError('Please select a product');
      setTimeout(() => setError(""), 2000);
      return;
    }
    if (removeForm.qty <= 0) {
      setError('Please input a valid quantity');
      setTimeout(() => setError(""), 2000);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data } = await axios.put("/api/stock", {
        ...removeForm,
        action: "remove",
      });
      setSuccess(data.message);
      setError("");
      setRemoveForm({
        product: "",
        department: user.role === "admin" ? "raw" : user.department,
        qty: 0,
      });
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove stock");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStock =
    user?.role === "admin"
      ? filter === "all"
        ? stock
        : stock.filter((s) => s.department === filter)
      : stock.filter((s) => s.department === user?.department);

  const getUnit = (productId) => {
    const product = products.find((p) => p._id === productId);
    return product?.unit || "";
  };

  const getDepartmentClass = (department) => {
    switch (department) {
      case "raw": return styles.departmentRaw;
      case "production": return styles.departmentProduction;
      case "finished": return styles.departmentFinished;
      default: return "";
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stock Management</h1>
        <p className={styles.subtitle}>Monitor and manage inventory levels</p>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className={styles.successBox}>
          {success}
        </div>
      )}
      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Add Stock: Only Admin */}
      {user?.role === "admin" && (
        <div className={styles.adminSection}>
          <h2 className={styles.sectionTitle}>Add Stock</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Product</label>
              <select
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                className={styles.formSelect}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={styles.formSelect}
              >
                <option value="raw">Raw Material Store</option>
                <option value="production">Production</option>
                <option value="finished">Finished Goods</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Quantity</label>
              <div className={styles.quantityInput}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={form.qty}
                  onChange={(e) =>
                    setForm({ ...form, qty: Number(e.target.value) })
                  }
                  className={styles.formInput}
                  min="1"
                />
                <span className={styles.unitDisplay}>{getUnit(form.product)}</span>
              </div>
            </div>

            <button
              onClick={addStock}
              disabled={isLoading}
              className={styles.addButton}
            >
              {isLoading ? "Adding..." : "Add Stock"}
            </button>
          </div>
        </div>
      )}

      {/* Remove Stock: Only Admin */}
      {user?.role === "admin" && (
        <div className={styles.adminSection}>
          <h2 className={styles.sectionTitle}>Remove Stock</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Product</label>
              <select
                value={removeForm.product}
                onChange={(e) =>
                  setRemoveForm({ ...removeForm, product: e.target.value })
                }
                className={styles.formSelect}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Department</label>
              <select
                value={removeForm.department}
                onChange={(e) =>
                  setRemoveForm({ ...removeForm, department: e.target.value })
                }
                className={styles.formSelect}
              >
                <option value="raw">Raw Material Store</option>
                <option value="production">Production</option>
                <option value="finished">Finished Goods</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Quantity</label>
              <div className={styles.quantityInput}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={removeForm.qty}
                  onChange={(e) =>
                    setRemoveForm({ ...removeForm, qty: Number(e.target.value) })
                  }
                  className={styles.formInput}
                  min="1"
                />
                <span className={styles.unitDisplay}>{getUnit(removeForm.product)}</span>
              </div>
            </div>

            <button
              onClick={removeStock}
              disabled={isLoading}
              className={styles.removeButton}
            >
              {isLoading ? "Removing..." : "Remove Stock"}
            </button>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className={styles.stockTable}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Stock Levels</h2>
          {user?.role === "admin" && (
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="raw">Raw Material Store</option>
              <option value="production">Production</option>
              <option value="finished">Finished Goods</option>
            </select>
          )}
        </div>

        {filteredStock.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Department</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((s) => (
                <tr key={s._id}>
                  <td>{s.product?.name}</td>
                  <td>
                    <span className={`${styles.departmentBadge} ${getDepartmentClass(s.department)}`}>
                      {s.department}
                    </span>
                  </td>
                  <td className={`${styles.quantityCell}`}>
                    {parseFloat(s.qty?.toFixed(4))} {s.product?.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📦</div>
            <p className={styles.emptyStateText}>No stock found</p>
          </div>
        )}
      </div>
    </div>
  );
}