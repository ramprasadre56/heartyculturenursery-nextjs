import Link from 'next/link';
import styles from './Hero.module.css';



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


        </section>
    );
}
