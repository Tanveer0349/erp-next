import { useState, useEffect } from "react";
import Router from "next/router";
import AdminControls from "@/components/AdminControls";
import RawMaterialPanel from "@/components/RawMaterialPanel";
import ProductionPanel from "@/components/ProductionPanel";
import FinishedGoodsPanel from "@/components/FinishedGoodsPanel";
import styles from "@/styles/dashboard.module.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getRole=()=>{

  return user.role==='raw' ? 'Raw Material Store' : 'Finished Goods';

  }

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) Router.push("/");
    else setUser(JSON.parse(u));
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    Router.push("/");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ERP Dashboard</h1>
          <p className={styles.userInfo}>
            Welcome, {user.name} • {formatTime(currentTime)}
          </p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <h2 className={styles.welcomeTitle}>Good {getTimeOfDay()}, {user.name}!</h2>
        <p className={styles.welcomeSubtitle}>You are logged in as {user.role === "admin" ? "Administrator" : getRole() + " Manager"}</p>
      </div>

      {/* Content wrapper to center cards */}
      <div className={styles.contentWrapper}>
        {user.role === "admin" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>Administrator Controls</div>
            <div className={styles.cardBody}>
              <AdminControls />
            </div>
          </div>
        )}
        
        {user.department === "raw" && user.role !== "admin" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>Raw Materials Management</div>
            <div className={styles.cardBody}>
              <RawMaterialPanel />
            </div>
          </div>
        )}
        
        {user.department === "production" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>Production Management</div>
            <div className={styles.cardBody}>
              <ProductionPanel />
            </div>
          </div>
        )}
        
        {user.department === "finished" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>Finished Goods Management</div>
            <div className={styles.cardBody}>
              <FinishedGoodsPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get time of day greeting
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default Dashboard;