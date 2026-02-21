import { Leaf } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.bottom}>
                <Leaf size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', opacity: 0.4 }} />
                <span>&copy; 2026 Govinda&apos;s Horticulture Nursery. All rights reserved.</span>
            </div>
        </footer>
    );
}
