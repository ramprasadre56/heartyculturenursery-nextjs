import Link from 'next/link';
import { CATEGORY_GROUPS } from '@/lib/categories';
import PlantSizesGuide from '@/components/PlantSizesGuide';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <PlantSizesGuide />

      {/* Browse Categories Section */}
      <section className={styles.categories}>
        <div className={styles.categoriesHeader}>
          <h2 className={styles.sectionTitle}>Browse Our Collection</h2>
          <p className={styles.sectionSubtitle}>
            From sacred trees to flowering shrubs — swipe to explore
          </p>
        </div>

        <div className={styles.groupsContainer}>
          {CATEGORY_GROUPS.map((group, groupIdx) => (
            <div key={group.group} className={styles.categoryGroup}>
              <div className={styles.groupHeader}>
                <span className={styles.groupNumber}>0{groupIdx + 1}</span>
                <h3 className={styles.groupTitle}>{group.group}</h3>
                <div className={styles.groupLine} />
              </div>
              <div className={styles.scrollRow}>
                <div className={styles.scrollTrack}>
                  {group.items.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/plants/${cat.slug}`}
                      className={styles.categoryCard}
                    >
                      <span className={styles.categoryIcon}>{cat.icon}</span>
                      <div className={styles.cardContent}>
                        <h4 className={styles.cardName}>{cat.name}</h4>
                        <span className={styles.cardArrow}>&#8594;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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
