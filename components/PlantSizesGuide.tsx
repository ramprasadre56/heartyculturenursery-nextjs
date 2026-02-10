"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './PlantSizesGuide.module.css';
import {
  GROW_BAG_CATEGORIES,
  POLY_PACK_CATEGORIES,
  type BagCategory,
  type PolyPackCategory,
} from '@/lib/plantSizes';

function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Visual sizes for bag representations (px)
const BAG_VISUAL_SIZES: Record<string, number> = {
  Small: 48,
  Medium: 64,
  Large: 80,
  'Extra Large': 100,
};

// Weight scale for progress bar fill (percentage)
const BAG_FILL_PERCENTAGES: Record<string, number> = {
  Small: 10,
  Medium: 30,
  Large: 55,
  'Extra Large': 100,
};

function BagSizeCard({ data, index }: { data: BagCategory; index: number }) {
  const reveal = useScrollReveal();
  const size = BAG_VISUAL_SIZES[data.category] || 60;
  const fillPercent = BAG_FILL_PERCENTAGES[data.category] || 50;

  return (
    <div
      ref={reveal.ref}
      className={`${styles.sizeCard} ${reveal.isVisible ? styles.sizeCardVisible : ''}`}
      style={{ '--delay': `${index * 150}ms`, '--fill-width': `${fillPercent}%` } as React.CSSProperties}
    >
      <div className={styles.visualContainer}>
        <div
          className={styles.bagVisual}
          style={{ width: `${size}px`, height: `${size * 1.2}px` }}
        >
          <span className={styles.visualIcon}>{data.icon}</span>
        </div>
      </div>

      <h3 className={styles.cardTitle}>{data.label}</h3>

      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Size: </span>
          {data.coverSize}
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Weight: </span>
          {data.weightRange} (Approx.)
        </span>
      </div>

      <p className={styles.cardDescription}>{data.description}</p>

      <div className={styles.progressBar}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} />
        </div>
        <span className={styles.progressLabel}>{data.weightRange}</span>
      </div>

      <div className={styles.sizeTagList} style={{ marginTop: '0.75rem' }}>
        {data.bags.map((bag) => (
          <span key={bag.size} className={styles.sizeTag}>
            {bag.size} &middot; {bag.weightKg}kg
          </span>
        ))}
      </div>
    </div>
  );
}

// Visual sizes for pot representations
const POT_VISUAL_SIZES: Record<string, number> = {
  'Ornamental/Retail': 60,
  Architectural: 90,
};

function PolyPackCard({ data, index }: { data: PolyPackCategory; index: number }) {
  const reveal = useScrollReveal();
  const size = POT_VISUAL_SIZES[data.category] || 70;

  return (
    <div
      ref={reveal.ref}
      className={`${styles.sizeCard} ${reveal.isVisible ? styles.sizeCardVisible : ''}`}
      style={{ '--delay': `${index * 200}ms` } as React.CSSProperties}
    >
      <div className={styles.visualContainer}>
        <div className={styles.potVisual}>
          <div
            className={styles.potBody}
            style={{ width: `${size}px`, height: `${size * 0.85}px` }}
          >
            <span className={styles.visualIcon}>{data.icon}</span>
          </div>
        </div>
      </div>

      <h3 className={styles.cardTitle}>{data.label}</h3>
      <p className={styles.cardDescription}>{data.description}</p>

      <table className={styles.packTable}>
        <thead>
          <tr>
            <th>Size</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {data.packs.map((pack) => (
            <tr key={pack.size}>
              <td>
                {pack.size}
                {pack.label && <span className={styles.packLabel}>{pack.label}</span>}
              </td>
              <td>{pack.weightKg} Kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlantSizesGuide() {
  const [activeTab, setActiveTab] = useState<'bags' | 'packs'>('bags');
  const sectionReveal = useScrollReveal({ threshold: 0.05 });

  return (
    <section
      ref={sectionReveal.ref}
      className={`${styles.section} ${sectionReveal.isVisible ? styles.sectionVisible : ''}`}
    >
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Plant Sizes &amp; Potting Guide</h2>
        <p className={styles.sectionSubtitle}>
          Understanding our container sizes helps you choose the right plant for your space
        </p>

        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tab} ${activeTab === 'bags' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('bags')}
          >
            Grow Bags
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'packs' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('packs')}
          >
            Poly Packs (PP)
          </button>
        </div>

        {/* Grow Bags */}
        <div className={`${styles.tabContent} ${activeTab === 'bags' ? styles.tabContentActive : ''}`}>
          <div className={styles.guideImageWrapper}>
            <Image
              src="/growbagsizes.png"
              alt="Bag Sizes & Potting Guide - Small (Seedling), Medium (Primary Growth), Large (Specimen Stock), Extra Large (Instant Greenery)"
              width={1200}
              height={600}
              className={styles.guideImage}
              priority
            />
          </div>
          <div className={styles.sizeGrid}>
            {GROW_BAG_CATEGORIES.map((cat, index) => (
              <BagSizeCard key={cat.category} data={cat} index={index} />
            ))}
          </div>
        </div>

        {/* Poly Packs */}
        <div className={`${styles.tabContent} ${activeTab === 'packs' ? styles.tabContentActive : ''}`}>
          <div className={styles.guideImageWrapper}>
            <Image
              src="/ppsizes.png"
              alt="Poly Packs (PP) Guide - 4-inch Liner Pack, 8-inch Retail Pot, 10-inch Advanced Growth Pack, 20-inch Advanced Growth Pack"
              width={1200}
              height={600}
              className={styles.guideImage}
            />
          </div>
          <div className={`${styles.sizeGrid} ${styles.sizeGridTwo}`}>
            {POLY_PACK_CATEGORIES.map((cat, index) => (
              <PolyPackCard key={cat.category} data={cat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
