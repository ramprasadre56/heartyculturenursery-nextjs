import Link from 'next/link';
import { PLANT_CATEGORIES } from '@/lib/categories';
import PlantSizesGuide from '@/components/PlantSizesGuide';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <PlantSizesGuide />

      {/* Browse Categories Section */}
      <section className={styles.categories}>
        <h2 className={styles.sectionTitle}>Browse Categories</h2>
        <p className={styles.sectionSubtitle}>
          Explore our collection organized by plant type
        </p>

        <div className={styles.categoryGrid}>
          {PLANT_CATEGORIES.slice(0, 12).map((cat) => (
            <Link
              key={cat.slug}
              href={`/plants/${cat.slug}`}
              className={styles.categoryCard}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <h3>{cat.name}</h3>
            </Link>
          ))}
        </div>

        <Link href="/plants" className={styles.viewAllLink}>
          View All Categories →
        </Link>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Transform Your Space with Nature</h2>
          <p>
            Whether you&apos;re creating a tropical garden, adding color with flowering shrubs,
            or growing your own fruit trees, we have the perfect plants for you.
          </p>
          <Link href="/plants" className={styles.ctaButton}>
            Start Shopping
          </Link>
        </div>
      </section>
    </>
  );
}
