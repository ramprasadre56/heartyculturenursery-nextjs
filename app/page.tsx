"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CATEGORY_GROUPS } from '@/lib/categories';
import PlantSizesGuide from '@/components/PlantSizesGuide';
import CategoryIcon from '@/components/CategoryIcon';
import styles from './page.module.css';

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function Home() {
  const categoriesReveal = useScrollReveal(0.05);
  const ctaReveal = useScrollReveal(0.15);

  return (
    <>
      {/* ========== HERO ========== */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGlowBottom} />

        <div className={styles.heroContent}>
          <div className={styles.heroAccentLine} />
          <h1 className={styles.heroTitle}>
            From Our Nursery
            <br />
            <span className={styles.heroTitleItalic}>to Your Place</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Discover over 400 varieties of premium plants — from sacred trees
            and tropical heliconias to rare philodendrons and architectural palms.
          </p>
          <Link href="/plants/sacred-trees" className={styles.heroButton}>
            <span>Explore the Collection</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>400+</span>
            <span className={styles.statLabel}>Plant Varieties</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>25+</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>Est.</span>
            <span className={styles.statLabel}>2005</span>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollDot} />
          <div className={styles.scrollTrail} />
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section
        ref={categoriesReveal.ref}
        className={`${styles.categories} ${categoriesReveal.isVisible ? styles.categoriesVisible : ''}`}
      >
        <div className={styles.categoriesHeader}>
          <span className={styles.categoriesEyebrow}>The Collection</span>
          <h2 className={styles.categoriesTitle}>Browse Our Plants</h2>
          <p className={styles.categoriesSubtitle}>
            Curated categories for every space and vision
          </p>
        </div>

        <div className={styles.groupsContainer}>
          {CATEGORY_GROUPS.map((group, groupIdx) => (
            <div key={group.group} className={styles.categoryGroup}>
              <div className={styles.groupHeader}>
                <span className={styles.groupNumber}>
                  {String(groupIdx + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.groupTitle}>{group.group}</h3>
                <div className={styles.groupLine} />
              </div>
              <div className={styles.categoryGrid}>
                {group.items.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/plants/${cat.slug}`}
                    className={styles.categoryCard}
                  >
                    <span className={styles.categoryIcon}><CategoryIcon slug={cat.slug} size={22} /></span>
                    <div className={styles.cardContent}>
                      <h4 className={styles.cardName}>{cat.name}</h4>
                      <span className={styles.cardArrow}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== PLANT SIZES GUIDE (kept as-is) ========== */}
      <PlantSizesGuide />

      {/* ========== CTA ========== */}
      <section
        ref={ctaReveal.ref}
        className={`${styles.cta} ${ctaReveal.isVisible ? styles.ctaVisible : ''}`}
      >
        <div className={styles.ctaGlow} />
        <div className={styles.ctaContent}>
          <span className={styles.ctaEyebrow}>Ready to Transform?</span>
          <h2 className={styles.ctaTitle}>
            Your Space Deserves
            <br />
            <span className={styles.ctaTitleItalic}>Something Extraordinary</span>
          </h2>
          <p className={styles.ctaDescription}>
            Whether you&apos;re creating a tropical garden, adding color with flowering
            shrubs, or growing your own fruit trees — we have the perfect plants for you.
          </p>
          <Link href="/plants/sacred-trees" className={styles.ctaButton}>
            <span>Start Shopping</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
