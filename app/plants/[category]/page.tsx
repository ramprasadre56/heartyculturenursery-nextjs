"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { loadPlantsByCategory, Plant } from '@/lib/data';
import { getCategoryBySlug } from '@/lib/categories';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import CategorySidebar from '@/components/CategorySidebar';
import PlantCard from '@/components/PlantCard';
import LoginModal from '@/components/LoginModal';
import styles from './page.module.css';

export default function CategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;

    const { status } = useUnifiedAuth();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const onLoginRequired = useCallback(() => setLoginModalOpen(true), []);

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
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                            <p>No plants found{searchQuery && ` for "${searchQuery}"`}</p>
                        </div>
                    ) : (
                        <div className="plant-grid">
                            {filteredPlants.map((plant, index) => (
                                <PlantCard
                                    key={`${plant.category}-${plant.id}-${index}`}
                                    plant={plant}
                                    onLoginRequired={status === 'authenticated' ? undefined : onLoginRequired}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />
        </div>
    );
}
