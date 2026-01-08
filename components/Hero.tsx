import Link from 'next/link';
import styles from './Hero.module.css';

const TAGLINES = [
    "Grow Green Dreams",
    "Nourish to Flourish",
    "From Seedling to Blooming Beauty",
];

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        From Our Nursery to Your Place
                    </h1>
                    <h2 className={styles.subtitle}>
                        Plants to Enrich Your Space
                    </h2>

                    <div className={styles.taglineContainer}>
                        <p className={`${styles.tagline} ${styles.tagline1}`}>
                            🌱 {TAGLINES[0]}
                        </p>
                        <p className={`${styles.tagline} ${styles.tagline2}`}>
                            🌿 {TAGLINES[1]}
                        </p>
                        <p className={`${styles.tagline} ${styles.tagline3}`}>
                            🌸 {TAGLINES[2]}
                        </p>
                    </div>

                    <Link href="/plants" className={styles.cta}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                        </svg>
                        <span>Order Now</span>
                    </Link>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button className={`${styles.navArrow} ${styles.navLeft}`}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"></path>
                </svg>
            </button>
            <button className={`${styles.navArrow} ${styles.navRight}`}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"></path>
                </svg>
            </button>

            {/* Pagination Dots */}
            <div className={styles.dots}>
                <div className={`${styles.dot} ${styles.dotActive}`}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
            </div>
        </section>
    );
}
