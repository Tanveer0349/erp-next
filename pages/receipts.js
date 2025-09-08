import { useState, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/transfer.module.css";

export default function InventoryTransfer() {
  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "null")
    : null;
  
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product: "",
    fromDepartment: user?.role === "admin" ? "raw" : user?.department,
    toDepartment: "production",
    qty: 0,
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const prodRes = await axios.get("/api/products");
      setProducts(prodRes.data);
    } catch (err) {
      setErrors({ general: "Failed to load products" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async () => {
    setErrors({});
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/transfer", {
        productId: form.product,
        fromDepartment: form.fromDepartment,
        toDepartment: form.toDepartment,
        qty: form.qty,
        user,
      });

      setForm({
        product: "",
        fromDepartment: user?.role === "admin" ? "raw" : user?.department,
        toDepartment: "production",
        qty: 0,
      });
      setSuccessMsg(res.data.message || "Transfer successful!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          const key = e.path === "productId" ? "product" : e.path;
          fieldErrors[key] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.response?.data?.message || "Transfer failed" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    if (errors.general) setErrors({});
    if (successMsg) setSuccessMsg("");
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
        <h1 className={styles.title}>Inventory Transfer</h1>
        <p className={styles.subtitle}>Move stock between departments</p>
      </div>

      {successMsg && (
        <div className={styles.successBox}>
          {successMsg}
        </div>
      )}
      
      {errors.general && (
        <div className={styles.errorBox}>
          {errors.general}
        </div>
      )}

      <div className={styles.transferCard}>
        <h2 className={styles.transferTitle}>Transfer Stock Between Departments</h2>

        <div className={styles.formGrid}>
          {/* Product Selection */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product</label>
            <select
              value={form.product}
              onChange={(e) => handleChange("product", e.target.value)}
              className={`${styles.formSelect} ${errors.product ? styles.inputError : ''}`}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
            {errors.product && (
              <p className={styles.errorText}>{errors.product}</p>
            )}
          </div>

          {/* Quantity */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={form.qty}
              onChange={(e) => handleChange("qty", Number(e.target.value))}
              className={`${styles.formInput} ${errors.qty ? styles.inputError : ''}`}
              min="1"
            />
            {errors.qty && (
              <p className={styles.errorText}>{errors.qty}</p>
            )}
          </div>
        </div>

        {/* Transfer Arrow Visualization */}
        <div className={styles.arrowContainer}>
          <div className={styles.arrow}>→</div>
        </div>

        <div className={styles.formGrid}>
          {/* From Department */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>From Department</label>
            <select
              value={form.fromDepartment}
              onChange={(e) => handleChange("fromDepartment", e.target.value)}
              className={`${styles.formSelect} ${errors.fromDepartment ? styles.inputError : ''}`}
              disabled={user?.role !== "admin"}
            >
              <option value="raw">Raw Material Store</option>
              <option value="production">Production</option>
              <option value="finished">Finished Goods</option>
            </select>
            {errors.fromDepartment && (
              <p className={styles.errorText}>{errors.fromDepartment}</p>
            )}
            {user?.role !== "admin" && (
              <p className={styles.formLabel} style={{marginTop: '8px', fontSize: '12px', color: '#6b7280'}}>
                Current department: <span className={getDepartmentClass(user?.department)}>
                  {getDepartmentName(user?.department)}
                </span>
              </p>
            )}
          </div>

          {/* To Department */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>To Department</label>
            <select
              value={form.toDepartment}
              onChange={(e) => handleChange("toDepartment", e.target.value)}
              className={`${styles.formSelect} ${errors.toDepartment ? styles.inputError : ''}`}
            >
              <option value="raw">Raw Material Store</option>
              <option value="production">Production</option>
              <option value="finished">Finished Goods</option>
            </select>
            {errors.toDepartment && (
              <p className={styles.errorText}>{errors.toDepartment}</p>
            )}
          </div>
        </div>

        <button   
          onClick={handleTransfer}
          disabled={isLoading}
          className={styles.transferButton}
        >
          {isLoading ? "Transferring..." : "Transfer Stock"}
        </button>
      </div>
    </div>
  );
}