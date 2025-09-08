// pages/index.js
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../styles/landing.module.css";

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    "Streamline your business operations",
    "Real-time inventory management",
    "Integrated financial analytics",
    "Customizable workflow automation"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.landingContainer}>
      {/* Animated background */}
      <div className={styles.animatedBackground}></div>
      
      {/* Main content */}
      <div className={styles.contentWrapper}>
        {/* Logo/Brand */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📊</span>
          <h1 className={styles.logoText}>ERP Next</h1>
        </div>

        {/* Hero section */}
        <div className={styles.heroSection}>
          <h1 className={styles.mainHeading}>
            Transform Your <span className={styles.highlight}>Business</span> Operations
          </h1>
          
          {/* Animated feature text */}
          <div className={styles.featureText}>
            {features.map((feature, index) => (
              <p 
                key={index} 
                className={`${styles.featureItem} ${index === currentFeature ? styles.featureItemActive : ''}`}
              >
                {feature}
              </p>
            ))}
          </div>

          {/* CTA Button */}
          <div className={styles.ctaContainer}>
            <Link href="/login">
              <button className={styles.ctaButton}>
                Get Started
                <span className={styles.buttonIcon}>→</span>
              </button>
            </Link>
          </div>

          {/* Stats preview */}
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Businesses Empowered</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>99.9%</span>
              <span className={styles.statLabel}>Uptime</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Support</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>© {new Date().getFullYear()} ERP Next. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}