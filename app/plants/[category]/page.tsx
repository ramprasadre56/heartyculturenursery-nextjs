"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { loadPlantsByCategory, Plant } from '@/lib/data';
import { getCategoryBySlug } from '@/lib/categories';
import CategorySidebar from '@/components/CategorySidebar';
import PlantCard from '@/components/PlantCard';
import styles from './page.module.css';

export default function CategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;

    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const category = getCategoryBySlug(categorySlug);

    useEffect(() => {
        async function fetchPlants() {
            setLoading(true);
            try {
                // Load plants from category-specific JSON file
                const categoryPlants = await loadPlantsByCategory(categorySlug);
                setPlants(categoryPlants);
            } catch (error) {
                console.error('Error loading plants:', error);
            }
            setLoading(false);
        }

        fetchPlants();
    }, [categorySlug]);

    const filteredPlants = useMemo(() => {
        if (!searchQuery) return plants;
        const query = searchQuery.toLowerCase();
        return plants.filter(
            p =>
                p.common_name?.toLowerCase().includes(query) ||
                p.scientific_name?.toLowerCase().includes(query)
        );
    }, [plants, searchQuery]);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className="page-header">
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>›</span>
                    <Link href="/plants">Plants</Link>
                    <span>›</span>
                    <span>{category?.name || categorySlug}</span>
                    <span className="badge">{plants.length}</span>
                </div>
                <div className="page-title-row">
                    <div className="page-icon">{category?.icon || '🌿'}</div>
                    <h1 className="page-title">{category?.name || categorySlug}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <CategorySidebar activeCategory={categorySlug} />

                <div className={styles.content}>
                    {/* Search */}
                    <div className="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder={`Search ${category?.name || 'plants'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Plant Grid */}
                    {loading ? (
                        <div className={styles.loading}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className={styles.skeleton}></div>
                            ))}
                        </div>
                    ) : filteredPlants.length === 0 ? (
                        <div className={styles.empty}>
                            <span>🌱</span>
                            <p>No plants found{searchQuery && ` for "${searchQuery}"`}</p>
                        </div>
                    ) : (
                        <div className="plant-grid">
                            {filteredPlants.map((plant) => (
                                <PlantCard key={`${plant.category}-${plant.id}`} plant={plant} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
