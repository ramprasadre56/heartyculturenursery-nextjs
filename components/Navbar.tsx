"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { PLANT_CATEGORIES } from '@/lib/categories';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { totalItems, toggleCart } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className={styles.header}>
            {/* Main Header Row */}
            <div className={styles.mainNav}>
                {/* Logo */}
                <Link href="/" className={styles.logoLink}>
                    <Image
                        src="/Logo/logo.jpg"
                        alt="Horticulture Nursery"
                        width={55}
                        height={55}
                        className={styles.logo}
                        priority
                    />
                </Link>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className={styles.searchInput}
                    />
                    <button className={styles.searchButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>

                {/* Account */}
                <div className={styles.accountLink}>
                    <span className={styles.accountLabel}>Hello, sign in</span>
                    <span className={styles.accountText}>Account</span>
                </div>

                {/* Cart */}
                <button className={styles.cartButton} onClick={toggleCart}>
                    <div className={styles.cartIconWrapper}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            {/* Sub Navigation */}
            <nav className={`${styles.subNav} ${menuOpen ? styles.mobileOpen : ''}`}>
                <button
                    className={styles.allButton}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
                                    <span className={styles.dropdownIcon}>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>



                <div className={styles.navLink}>
                    <span className={styles.navIcon}>🌱</span>
                    <span>Seeds</span>
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
            </nav>
        </header>
    );
}
