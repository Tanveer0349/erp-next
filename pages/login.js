import { useState } from "react";
import axios from "axios";
import Router from "next/router";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validate();
    
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      // Store JWT token and user info in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to dashboard after successful login
      Router.push("/dashboard");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    // Remove error once user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern}></div>
      
      <form onSubmit={submit} className={styles.formContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your ERP account</p>
        </div>

        {serverError && (
          <div className={styles.serverError}>
            {serverError}
          </div>
        )}

        {/* Email field */}
        <div className={styles.inputGroup}>
          <input
            value={email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Email address"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            type="email"
          />
          {errors.email && (
            <p className={styles.errorText}>{errors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div className={styles.inputGroup}>
          <input
            value={password}
            onChange={(e) => handleChange("password", e.target.value)}
            type="password"
            placeholder="Password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          />
          {errors.password && (
            <p className={styles.errorText}>{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className={styles.footer}>
          ERP System • Secure Login
        </div>
      </form>
    </div>
  );
}