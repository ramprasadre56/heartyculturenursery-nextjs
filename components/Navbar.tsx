"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { PLANT_CATEGORIES } from "@/lib/categories";
import { SEED_CATEGORIES } from "@/lib/seedCategories";
import styles from "./Navbar.module.css";
import LoginModal from "./LoginModal";
import CategoryIcon from "./CategoryIcon";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

function LeafIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function SeedlingIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V10" />
      <path d="M6 14c0-3.5 2.5-6 6-6" />
      <path d="M18 10c0-4-3-7-6-8" />
      <path d="M12 2c3 1 6 4 6 8" />
    </svg>
  );
}

function HeartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function PenIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function InfoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ClipboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function SettingsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogOutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems, toggleCart } = useCart();
  const { user, status, signOut: firebaseSignOut } = useAuth();
  const session = user ? { user } : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [seedsDropdownOpen, setSeedsDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    setAccountDropdownOpen(false);
    await firebaseSignOut();
  };

  return (
    <header className={styles.header}>
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

        {/* Navigation Items */}
        <div
          className={`${styles.navItems} ${menuOpen ? styles.mobileOpen : ""}`}
        >


          {/* Plants Dropdown */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className={styles.navLink}>
              <span className={styles.navIcon}><LeafIcon /></span>
              <span>Plants</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <span className={styles.dropdownIcon}><CategoryIcon slug={cat.slug} size={16} /></span>
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
              <span className={styles.navIcon}><SeedlingIcon /></span>
              <span>Seeds</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <span className={styles.dropdownIcon}><CategoryIcon slug={cat.slug} size={16} /></span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={styles.navLink}>
            <span className={styles.navIcon}><HeartIcon /></span>
            <span>Plant Care</span>
          </div>

          <Link href="#" className={styles.navLink}>
            <span className={styles.navIcon}><PenIcon /></span>
            <span>Blog</span>
          </Link>

          <Link href="#" className={styles.navLink}>
            <span className={styles.navIcon}><InfoIcon /></span>
            <span>Our Story</span>
          </Link>

          <Link href="/assistant" className={styles.navLink}>
            <span className={styles.navIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </span>
            <span>Assistant</span>
          </Link>

          <Link href="/contact" className={styles.navLink}>
            <span className={styles.navIcon}><MailIcon /></span>
            <span>Contact Us</span>
          </Link>
        </div>

        {/* Account */}
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
            <div className={styles.accountLink}>
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
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginLeft: "4px", transform: "translateY(2px)" }}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </div>
            </div>

            {accountDropdownOpen && (
              <div className={styles.accountDropdownMenu}>
                <div className={styles.dropdownHeader}>
                  Your Account
                </div>
                <Link
                  href="/account"
                  className={styles.dropdownItem}
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <span className={styles.dropdownIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M20 21a8 8 0 1 0-16 0" />
                    </svg>
                  </span>
                  <span>My Account</span>
                </Link>
                <Link
                  href="/orders"
                  className={styles.dropdownItem}
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <span className={styles.dropdownIcon}><ClipboardIcon /></span>
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/admin"
                  className={styles.dropdownItem}
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <span className={styles.dropdownIcon}><SettingsIcon /></span>
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
                  <span className={styles.dropdownIcon}><LogOutIcon /></span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={styles.accountLink}
            onClick={() => setLoginModalOpen(true)}
          >
            <span className={styles.accountLabel}>Hello, sign in</span>
            <span className={styles.accountText}>Account</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Cart */}
        <button className={styles.cartButton} onClick={toggleCart}>
          <div className={styles.cartIconWrapper}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
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
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
