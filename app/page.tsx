import Hero from '@/components/Hero';
import Link from 'next/link';
import { PLANT_CATEGORIES } from '@/lib/categories';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Hero />

      {/* What We Offer Section */}
      <section className={styles.offers}>
        <h2 className={styles.sectionTitle}>What We Offer</h2>
        <p className={styles.sectionSubtitle}>
          Discover our wide range of plants for every garden and space
        </p>

        <div className={styles.offerGrid}>
          <div className={styles.offerCard}>
            <span className={styles.offerIcon}>🌸</span>
            <h3>400+ Plant Varieties</h3>
            <p>From flowering shrubs to fruit trees, we have something for everyone</p>
          </div>
          <div className={styles.offerCard}>
            <span className={styles.offerIcon}>🌿</span>
            <h3>Expert Care Tips</h3>
            <p>Each plant comes with care instructions to help it thrive</p>
          </div>
          <div className={styles.offerCard}>
            <span className={styles.offerIcon}>🚚</span>
            <h3>Safe Delivery</h3>
            <p>Plants carefully packaged and delivered to your doorstep</p>
          </div>
          <div className={styles.offerCard}>
            <span className={styles.offerIcon}>💬</span>
            <h3>WhatsApp Support</h3>
            <p>Order easily via WhatsApp and get personalized assistance</p>
          </div>
        </div>
      </section>

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
