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
