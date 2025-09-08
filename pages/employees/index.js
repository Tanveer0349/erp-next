import { useState, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/employees.module.css";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "raw",
    role: "employee",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get("/api/employees");
      setEmployees(data);
    } catch (err) {
      setServerError("Failed to load employees");
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    if (serverError) setServerError("");
  };

  const addEmployee = async () => {
    try {
      setErrors({});
      setServerError("");
      setIsLoading(true);
      
      await axios.post("/api/employees", form);
      setForm({
        name: "",
        email: "",
        password: "",
        department: "raw",
        role: "employee",
      });
      fetchEmployees();
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(err.response?.data?.message || "Failed to add employee");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    
    try {
      await axios.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      setServerError("Failed to delete employee");
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

  const getRoleClass = (role) => {
    switch (role) {
      case "employee": return styles.roleEmployee;
      case "admin": return styles.roleAdmin;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Employees</h1>
        <p className={styles.subtitle}>Add and manage employee accounts</p>
      </div>

      {serverError && (
        <div className={styles.errorBox}>
          {serverError}
        </div>
      )}

      {/* Add Employee Form */}
      <div className={styles.addEmployeeCard}>
        <h2 className={styles.addEmployeeTitle}>Add New Employee</h2>
        
        <div className={styles.formGrid}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
            />
            {errors.name && (
              <p className={styles.errorText}>{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
            />
            {errors.email && (
              <p className={styles.errorText}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
            />
            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          {/* Department */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Department</label>
            <select
              value={form.department}
              onChange={(e) => handleChange("department", e.target.value)}
              className={styles.formSelect}
            >
              <option value="raw">Raw Material Store</option>
              <option value="production">Production</option>
              <option value="finished">Finished Goods</option>
            </select>
          </div>

          {/* Role */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role</label>
            <select
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className={styles.formSelect}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          onClick={addEmployee}
          disabled={isLoading}
          className={styles.addButton}
        >
          {isLoading ? "Adding..." : "Add Employee"}
        </button>
      </div>

      {/* Employees List */}
      <div className={styles.employeesList}>
        <div className={styles.listHeader}>
          {employees.length} Employee{employees.length !== 1 ? 's' : ''}
        </div>
        
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div key={emp._id} className={styles.employeeItem}>
              <div className={styles.employeeName}>{emp.name}</div>
              <div className={styles.employeeEmail}>{emp.email}</div>
              <span className={`${styles.departmentBadge} ${getDepartmentClass(emp.department)}`}>
                {emp.department}
              </span>
              <span className={`${styles.roleBadge} ${getRoleClass(emp.role)}`}>
                {emp.role}
              </span>
              <button
                onClick={() => deleteEmployee(emp._id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>👥</div>
            <p className={styles.emptyStateText}>No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
}