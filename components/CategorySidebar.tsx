"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PLANT_CATEGORIES } from '@/lib/categories';
import styles from './CategorySidebar.module.css';

interface CategorySidebarProps {
    activeCategory?: string;
}

export default function CategorySidebar({ activeCategory }: CategorySidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        if (saved) {
            setIsCollapsed(saved === 'true');
        }
    }, []);

    // Save preference to localStorage
    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', String(newState));
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            {/* Collapse Toggle Button */}
            <button
                onClick={toggleCollapse}
                className={styles.collapseBtn}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`${styles.collapseIcon} ${isCollapsed ? styles.rotated : ''}`}
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {/* Title - hide when collapsed */}
            {!isCollapsed && (
                <h3 className={styles.title}>CATEGORY</h3>
            )}

            <nav className={styles.categoryList}>
                {PLANT_CATEGORIES.map((cat) => {
                    const isActive = cat.slug === activeCategory;
                    return (
                        <Link
                            key={cat.slug}
                            href={`/plants/${cat.slug}`}
                            className={`${styles.categoryItem} ${isActive ? styles.active : ''}`}
                            title={isCollapsed ? cat.name : undefined}
                        >
                            <span className={styles.icon}>{cat.icon}</span>
                            {!isCollapsed && (
                                <span className={styles.name}>{cat.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
