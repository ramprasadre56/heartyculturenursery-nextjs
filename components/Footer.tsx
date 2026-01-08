import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h3 className={styles.brandName}>🌿 Horticulture Nursery</h3>
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
                <p>&copy; 2026 Horticulture Nursery. All rights reserved.</p>
            </div>
        </footer>
    );
}
