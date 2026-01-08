"use client";

import Link from 'next/link';
import { PLANT_CATEGORIES } from '@/lib/categories';
import styles from './CategorySidebar.module.css';

interface CategorySidebarProps {
    activeCategory?: string;
}

export default function CategorySidebar({ activeCategory }: CategorySidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <h3 className={styles.title}>CATEGORY</h3>

            <Link href="/plants" className={styles.backLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"></path>
                </svg>
                <span>All Plants</span>
            </Link>

            <nav className={styles.categoryList}>
                {PLANT_CATEGORIES.map((cat) => {
                    const isActive = cat.slug === activeCategory;
                    return (
                        <Link
                            key={cat.slug}
                            href={`/plants/${cat.slug}`}
                            className={`${styles.categoryItem} ${isActive ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{cat.icon}</span>
                            <span className={styles.name}>{cat.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
