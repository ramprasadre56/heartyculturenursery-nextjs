import Link from 'next/link';
import { PLANT_CATEGORIES } from '@/lib/categories';
import styles from './page.module.css';

export const metadata = {
    title: 'All Plants - Horticulture Nursery',
    description: 'Browse all plant categories including flowering shrubs, palms, fruit trees, heliconia, and more.',
};

export default function PlantsPage() {
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className="page-header">
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>›</span>
                    <span>Plants</span>
                </div>
                <div className="page-title-row">
                    <div className="page-icon">🌿</div>
                    <h1 className="page-title">All Plants</h1>
                    <span className="badge">{PLANT_CATEGORIES.length} Categories</span>
                </div>
            </div>

            {/* Category Grid */}
            <div className={styles.content}>
                <p className={styles.intro}>
                    Explore our collection of 400+ plant varieties organized into {PLANT_CATEGORIES.length} categories.
                    Click on any category to browse available plants.
                </p>

                <div className={styles.grid}>
                    {PLANT_CATEGORIES.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/plants/${cat.slug}`}
                            className={styles.card}
                        >
                            <span className={styles.icon}>{cat.icon}</span>
                            <h2 className={styles.cardTitle}>{cat.name}</h2>
                            <span className={styles.arrow}>→</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
