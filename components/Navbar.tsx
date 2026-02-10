"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useCart } from "@/context/CartContext";
import { PLANT_CATEGORIES } from "@/lib/categories";
import { SEED_CATEGORIES } from "@/lib/seedCategories";
import { supabase } from "@/lib/supabase";
import styles from "./Navbar.module.css";
import LoginModal from "./LoginModal";

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const { user, status } = useUnifiedAuth();
  const session = user ? { user } : null; // Adapter for existing code
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [seedsDropdownOpen, setSeedsDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    setAccountDropdownOpen(false);
    // Sign out from both providers
    await Promise.all([
      signOut({ redirect: false }), // NextAuth
      supabase ? supabase.auth.signOut() : Promise.resolve(), // Supabase
    ]);
    window.location.reload(); // Force refresh to clear state
  };

  return (
    <header className={styles.header}>
      {/* Main Header Row */}
      <div className={styles.mainNav}>
        {/* Logo */}
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/govindalogo.png"
            alt="Govinda's Horticulture Nursery"
            width={180}
            height={55}
            className={styles.logo}
            priority
          />
        </Link>

        {/* Navigation Items (Hidden on Mobile) */}
        <div
          className={`${styles.navItems} ${menuOpen ? styles.mobileOpen : ""}`}
        >
          <button
            className={styles.allButton}
            onClick={() => setMenuOpen(!menuOpen)} // Keep logic for mobile closing
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <span>All</span>
          </button>

          {/* Plants Dropdown */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className={styles.navLink}>
              <span className={styles.navIcon}>🌿</span>
              <span>Plants</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                {PLANT_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/plants/${cat.slug}`}
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className={styles.dropdownIcon}>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Seeds Dropdown */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setSeedsDropdownOpen(true)}
            onMouseLeave={() => setSeedsDropdownOpen(false)}
          >
            <button className={styles.navLink}>
              <span className={styles.navIcon}>🌱</span>
              <span>Seeds</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>

            {seedsDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {SEED_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/seeds/${cat.slug}`}
                    className={styles.dropdownItem}
                    onClick={() => setSeedsDropdownOpen(false)}
                  >
                    <span className={styles.dropdownIcon}>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={styles.navLink}>
            <span className={styles.navIcon}>💚</span>
            <span>Plant Care</span>
          </div>

          <Link href="#" className={styles.navLink}>
            <span className={styles.navIcon}>📝</span>
            <span>Blog</span>
          </Link>

          <Link href="#" className={styles.navLink}>
            <span className={styles.navIcon}>ℹ️</span>
            <span>Our Story</span>
          </Link>

          {/* Chat link hidden
                    <Link href="/chat" className={styles.navLink}>
                        <span className={styles.navIcon}>💬</span>
                        <span>Chat</span>
                    </Link>
                    */}
        </div>

        {/* Account - Google Sign In */}
        {status === "loading" ? (
          <div className={styles.accountLink}>
            <span className={styles.accountLabel}>Loading...</span>
          </div>
        ) : session ? (
          <div
            className={styles.accountDropdown}
            onMouseEnter={() => setAccountDropdownOpen(true)}
            onMouseLeave={() => setAccountDropdownOpen(false)}
          >
            <div className={styles.accountLink} style={{ cursor: "pointer" }}>
              <span className={styles.accountLabel}>
                Hello, {session.user?.name?.split(" ")[0] || "User"}
              </span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className={styles.accountText}>Account & Lists</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  style={{ marginLeft: "4px", transform: "translateY(2px)" }}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </div>
            </div>

            {accountDropdownOpen && (
              <div className={styles.accountDropdownMenu}>
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Your Account
                </div>
                <Link
                  href="/orders"
                  className={styles.dropdownItem}
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <span className={styles.dropdownIcon}>📋</span>
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/admin"
                  className={styles.dropdownItem}
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <span className={styles.dropdownIcon}>🔧</span>
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  className={styles.dropdownItem}
                  onClick={handleSignOut}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  <span className={styles.dropdownIcon}>🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={styles.accountLink}
            onClick={() => setLoginModalOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <span className={styles.accountLabel}>Hello, sign in</span>
            <span className={styles.accountText}>Account</span>
          </div>
        )}

        {/* Cart */}
        <button className={styles.cartButton} onClick={toggleCart}>
          <div className={styles.cartIconWrapper}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
            {totalItems > 0 && (
              <span className={styles.cartCount}>{totalItems}</span>
            )}
          </div>
          <span className={styles.cartText}>Cart</span>
        </button>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </header>
  );
}
