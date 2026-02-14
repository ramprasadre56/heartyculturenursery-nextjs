import { Leaf, MessageCircle, Instagram, Facebook, Youtube } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h3 className={styles.brandName}>
                        <Leaf size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', opacity: 0.6 }} />
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
                        <a href="#" className={styles.socialLink}>
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                        </a>
                        <a href="#" className={styles.socialLink}>
                            <Instagram size={14} />
                            <span>Instagram</span>
                        </a>
                        <a href="#" className={styles.socialLink}>
                            <Facebook size={14} />
                            <span>Facebook</span>
                        </a>
                        <a href="#" className={styles.socialLink}>
                            <Youtube size={14} />
                            <span>YouTube</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className={styles.bottom}>
                <p>&copy; 2026 Govinda&apos;s Horticulture Nursery. All rights reserved.</p>
            </div>
        </footer>
    );
}
