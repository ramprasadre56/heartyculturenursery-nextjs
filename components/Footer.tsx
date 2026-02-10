import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h3 className={styles.brandName}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                            <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                        </svg>
                        Govinda&apos;s Horticulture Nursery
                    </h3>
                    <p className={styles.tagline}>From Our Nursery to Your Place</p>
                </div>

                <div className={styles.links}>
                    <div className={styles.linkGroup}>
                        <h4>Shop</h4>
                        <a href="/plants">All Plants</a>
                        <a href="/plants/flowering-shrubs">Flowering Shrubs</a>
                        <a href="/plants/palm-varieties">Palm Varieties</a>
                        <a href="/plants/fruit-varieties">Fruit Trees</a>
                    </div>

                    <div className={styles.linkGroup}>
                        <h4>Help</h4>
                        <a href="#">Contact Us</a>
                        <a href="#">Shipping Info</a>
                        <a href="#">Returns</a>
                        <a href="#">FAQs</a>
                    </div>

                    <div className={styles.linkGroup}>
                        <h4>Connect</h4>
                        <a href="#">WhatsApp</a>
                        <a href="#">Instagram</a>
                        <a href="#">Facebook</a>
                        <a href="#">YouTube</a>
                    </div>
                </div>
            </div>

            <div className={styles.bottom}>
                <p>&copy; 2026 Govinda&apos;s Horticulture Nursery. All rights reserved.</p>
            </div>
        </footer>
    );
}
