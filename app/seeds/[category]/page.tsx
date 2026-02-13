"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSeedCategoryBySlug, SEED_CATEGORIES } from '@/lib/seedCategories';
import LoginModal from '@/components/LoginModal';
import styles from './page.module.css';

interface Seed {
    id: number;
    name: string;
    scientific_name?: string;
    category: string;
    image?: string;
}

// Mock seed data - replace with actual data loading
const MOCK_SEEDS: Record<string, Seed[]> = {
    'flower-seeds': [
        { id: 1, name: 'Marigold Seeds', scientific_name: 'Tagetes', category: 'Flower Seeds', image: '/images/seeds/marigold.jpg' },
        { id: 2, name: 'Sunflower Seeds', scientific_name: 'Helianthus', category: 'Flower Seeds', image: '/images/seeds/sunflower.jpg' },
        { id: 3, name: 'Rose Seeds', scientific_name: 'Rosa', category: 'Flower Seeds', image: '/images/seeds/rose.jpg' },
        { id: 4, name: 'Zinnia Seeds', scientific_name: 'Zinnia elegans', category: 'Flower Seeds', image: '/images/seeds/zinnia.jpg' },
    ],
    'vegetables-seeds': [
        { id: 1, name: 'Tomato Seeds', scientific_name: 'Solanum lycopersicum', category: 'Vegetables Seeds', image: '/images/seeds/tomato.jpg' },
        { id: 2, name: 'Carrot Seeds', scientific_name: 'Daucus carota', category: 'Vegetables Seeds', image: '/images/seeds/carrot.jpg' },
        { id: 3, name: 'Brinjal Seeds', scientific_name: 'Solanum melongena', category: 'Vegetables Seeds', image: '/images/seeds/brinjal.jpg' },
        { id: 4, name: 'Spinach Seeds', scientific_name: 'Spinacia oleracea', category: 'Vegetables Seeds', image: '/images/seeds/spinach.jpg' },
    ],
    'herbs-seeds': [
        { id: 1, name: 'Basil Seeds', scientific_name: 'Ocimum basilicum', category: 'Herbs Seeds', image: '/images/seeds/basil.jpg' },
        { id: 2, name: 'Coriander Seeds', scientific_name: 'Coriandrum sativum', category: 'Herbs Seeds', image: '/images/seeds/coriander.jpg' },
        { id: 3, name: 'Mint Seeds', scientific_name: 'Mentha', category: 'Herbs Seeds', image: '/images/seeds/mint.jpg' },
        { id: 4, name: 'Parsley Seeds', scientific_name: 'Petroselinum crispum', category: 'Herbs Seeds', image: '/images/seeds/parsley.jpg' },
    ],
    'fruits-seeds': [
        { id: 1, name: 'Watermelon Seeds', scientific_name: 'Citrullus lanatus', category: 'Fruits Seeds', image: '/images/seeds/watermelon.jpg' },
        { id: 2, name: 'Muskmelon Seeds', scientific_name: 'Cucumis melo', category: 'Fruits Seeds', image: '/images/seeds/muskmelon.jpg' },
        { id: 3, name: 'Papaya Seeds', scientific_name: 'Carica papaya', category: 'Fruits Seeds', image: '/images/seeds/papaya.jpg' },
        { id: 4, name: 'Strawberry Seeds', scientific_name: 'Fragaria', category: 'Fruits Seeds', image: '/images/seeds/strawberry.jpg' },
    ],
};

export default function SeedCategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const { status } = useAuth();
    const isAuthenticated = status === 'authenticated';

    const [seeds, setSeeds] = useState<Seed[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const category = getSeedCategoryBySlug(categorySlug);

    useEffect(() => {
        setLoading(true);
        // Simulate loading - replace with actual data loading
        setTimeout(() => {
            setSeeds(MOCK_SEEDS[categorySlug] || []);
            setLoading(false);
        }, 300);
    }, [categorySlug]);

    const filteredSeeds = useMemo(() => {
        if (!searchQuery) return seeds;
        const query = searchQuery.toLowerCase();
        return seeds.filter(
            s =>
                s.name?.toLowerCase().includes(query) ||
                s.scientific_name?.toLowerCase().includes(query)
        );
    }, [seeds, searchQuery]);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className="page-header">
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>›</span>
                    <Link href="/seeds">Seeds</Link>
                    <span>›</span>
                    <span>{category?.name || categorySlug}</span>
                    <span className="badge">{seeds.length}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>CATEGORY</h3>
                    <nav className={styles.categoryList}>
                        {SEED_CATEGORIES.map((cat) => {
                            const isActive = cat.slug === categorySlug;
                            return (
                                <Link
                                    key={cat.slug}
                                    href={`/seeds/${cat.slug}`}
                                    className={`${styles.categoryItem} ${isActive ? styles.active : ''}`}
                                >
                                    <span className={styles.icon}>{cat.icon}</span>
                                    <span className={styles.name}>{cat.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className={styles.content}>
                    {/* Search */}
                    <div className="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder={`Search ${category?.name || 'seeds'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Seed Grid */}
                    {loading ? (
                        <div className={styles.loading}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={styles.skeleton}></div>
                            ))}
                        </div>
                    ) : filteredSeeds.length === 0 ? (
                        <div className={styles.empty}>
                            <span>🌱</span>
                            <p>No seeds found{searchQuery && ` for "${searchQuery}"`}</p>
                        </div>
                    ) : (
                        <div className="plant-grid">
                            {filteredSeeds.map((seed, index) => (
                                <div key={`${seed.category}-${seed.id}-${index}`} className={styles.seedCard}>
                                    <div className={styles.seedImage}>
                                        <div className={styles.imagePlaceholder}>{category?.icon || '🌱'}</div>
                                    </div>
                                    <div className={styles.seedDetails}>
                                        <h3 className={styles.seedName}>{seed.name}</h3>
                                        {seed.scientific_name && (
                                            <p className={styles.seedScientific}>{seed.scientific_name}</p>
                                        )}
                                        <button
                                            className={styles.addToCart}
                                            onClick={() => { if (!isAuthenticated) setLoginModalOpen(true); }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="8" cy="21" r="1"></circle>
                                                <circle cx="19" cy="21" r="1"></circle>
                                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                                            </svg>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
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
