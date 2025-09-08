import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import styles from "@/styles/products.module.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "raw",
    unit: "pcs",
    recipe: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchRawProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      setErrors({ general: "Failed to load products" });
    }
  };

  const fetchRawProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setRawProducts(res.data.filter((p) => p.category === "raw"));
    } catch (err) {
      console.error("Failed to load raw products", err);
    }
  };

  const handleErrorResponse = (err) => {
    if (err.response?.data?.errors) {
      const fieldErrors = {};
      err.response.data.errors.forEach((e) => {
        fieldErrors[e.path] = e.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({ general: err.response?.data?.message || "Request failed" });
    }
  };

  const addProduct = async () => {
    try {
      setErrors({});
      setIsLoading(true);
      await axios.post("/api/products", form);
      resetForm();
      fetchProducts();
      fetchRawProducts();
    } catch (err) {
      handleErrorResponse(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async () => {
    try {
      setErrors({});
      setIsLoading(true);
      await axios.put(`/api/products/${editingId}`, form);
      resetForm();
      fetchProducts();
      fetchRawProducts();
    } catch (err) {
      handleErrorResponse(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
      fetchRawProducts();
    } catch (err) {
      setErrors({ general: "Failed to delete product" });
    }
  };

  const startEdit = (product) => {
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      lowStockThreshold: product.lowStockThreshold,
      recipe: product.recipe || [],
    });
    setEditingId(product._id);
  };

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      category: "raw",
      unit: "pcs",
      lowStockThreshold: 0,
      recipe: [],
    });
    setEditingId(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    if (errors.general) setErrors({});
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case "raw": return styles.categoryRaw;
      case "finished": return styles.categoryFinished;
      default: return "";
    }
  };

  const getUnitClass = (unit) => {
    switch (unit) {
      case "pcs": return styles.unitPcs;
      case "kg": return styles.unitKg;
      case "l": return styles.unitL;
      default: return styles.unitPcs;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Products</h1>
        <p className={styles.subtitle}>Add and manage products and raw materials</p>
      </div>

      {errors.general && (
        <div className={styles.errorBox}>
          {errors.general}
        </div>
      )}

      {/* Product Form */}
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        <div className={styles.formGrid}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product Name</label>
            <input
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
            />
            {errors.name && (
              <p className={styles.errorText}>{errors.name}</p>
            )}
          </div>

          {/* SKU */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>SKU Code</label>
            <input
              placeholder="Enter SKU code"
              value={form.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
              className={`${styles.formInput} ${errors.sku ? styles.inputError : ''}`}
            />
            {errors.sku && (
              <p className={styles.errorText}>{errors.sku}</p>
            )}
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={`${styles.formSelect} ${errors.category ? styles.inputError : ''}`}
            >
              <option value="raw">Raw Material</option>
              <option value="finished">Finished Product</option>
            </select>
            {errors.category && (
              <p className={styles.errorText}>{errors.category}</p>
            )}
          </div>

          {/* Unit */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Unit</label>
            <input
              placeholder="e.g., pcs, kg, l"
              value={form.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              className={`${styles.formInput} ${errors.unit ? styles.inputError : ''}`}
            />
            {errors.unit && (
              <p className={styles.errorText}>{errors.unit}</p>
            )}
          </div>
        </div>

        {/* Recipe / BOM for Finished Products */}
        {form.category === "finished" && (
          <div className={styles.recipeSection}>
            <h3 className={styles.recipeTitle}>Bill of Materials</h3>

            {form.recipe.map((item, idx) => (
              <div key={idx} className={styles.recipeItem}>
                <div className={styles.selectContainer}>
                  <Select
                    options={rawProducts.map((p) => ({
                      value: p._id,
                      label: `${p.name} (${p.sku})`,
                    }))}
                    value={
                      rawProducts
                        .map((p) => ({
                          value: p._id,
                          label: `${p.name} (${p.sku})`,
                        }))
                        .find((opt) => opt.value === item.rawProduct) || null
                    }
                    onChange={(selected) => {
                      const newRecipe = [...form.recipe];
                      newRecipe[idx].rawProduct = selected.value;
                      setForm({ ...form, recipe: newRecipe });
                    }}
                    placeholder="Select raw material..."
                    isSearchable
                  />
                </div>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.qty}
                  onChange={(e) => {
                    const newRecipe = [...form.recipe];
                    newRecipe[idx].qty = Number(e.target.value);
                    setForm({ ...form, recipe: newRecipe });
                  }}
                  className={styles.formInput}
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newRecipe = form.recipe.filter((_, i) => i !== idx);
                    setForm({ ...form, recipe: newRecipe });
                  }}
                  className={styles.removeRecipeButton}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  recipe: [...form.recipe, { rawProduct: "", qty: 1 }],
                })
              }
              className={styles.addRecipeButton}
            >
              + Add Material
            </button>

            {errors.recipe && (
              <p className={styles.errorText}>{errors.recipe}</p>
            )}
          </div>
        )}

        <div className={styles.formActions}>
          {editingId ? (
            <>
              <button
                onClick={updateProduct}
                disabled={isLoading}
                className={styles.saveButton}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={resetForm}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={addProduct}
              disabled={isLoading}
              className={styles.addButton}
            >
              {isLoading ? "Adding..." : "Add Product"}
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className={styles.productsList}>
        <div className={styles.listHeader}>
          {products.length} Product{products.length !== 1 ? 's' : ''}
        </div>
        
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p._id} className={styles.productItem}>
              <div>
                <div className={styles.productName}>{p.name}</div>
                <div className={styles.productSku}>{p.sku}</div>
              </div>
              <span className={`${styles.categoryBadge} ${getCategoryClass(p.category)}`}>
                {p.category}
              </span>
              <span className={`${styles.unitBadge} ${getUnitClass(p.unit)}`}>
                {p.unit}
              </span>
              <div className={styles.actionButtons}>
                <button
                  onClick={() => startEdit(p)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📦</div>
            <p className={styles.emptyStateText}>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}