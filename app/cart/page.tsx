"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
    const {
        cartItems,
        totalItems,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart
    } = useCart();

    // Generate WhatsApp message
    const generateWhatsAppMessage = () => {
        if (cartItems.length === 0) return '';

        let message = "🌿 *Horticulture Nursery Order*\n\n";
        message += "Hello! I would like to order the following plants:\n\n";

        cartItems.forEach((item, index) => {
            const name = item.common_name !== "Unknown" ? item.common_name : item.scientific_name;
            message += `${index + 1}. *${name}* (Qty: ${item.quantity})\n`;
            if (item.scientific_name && item.common_name !== item.scientific_name) {
                message += `   _${item.scientific_name}_\n`;
            }
        });

        message += `\n📦 Total Items: ${totalItems}\n`;
        message += "\nPlease let me know the availability and pricing. Thank you! 🙏";

        return encodeURIComponent(message);
    };

    const whatsappNumber = "918919029601";
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className="page-header">
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>›</span>
                    <span>Cart</span>
                </div>
                <div className="page-title-row">
                    <div className="page-icon">🛒</div>
                    <h1 className="page-title">Your Cart</h1>
                    <span className="badge">{totalItems} items</span>
                </div>
            </div>

            <div className={styles.content}>
                {cartItems.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <span className={styles.emptyIcon}>🌱</span>
                        <h2>Your cart is empty</h2>
                        <p>Add some beautiful plants to get started!</p>
                        <Link href="/plants" className={styles.browseLink}>
                            Browse Plants
                        </Link>
                    </div>
                ) : (
                    <div className={styles.cartLayout}>
                        {/* Cart Items */}
                        <div className={styles.itemsList}>
                            {cartItems.map((item) => (
                                <div key={item.unique_id} className={styles.cartItem}>
                                    <div className={styles.itemImage}>
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.common_name || item.scientific_name}
                                                width={120}
                                                height={120}
                                                className={styles.image}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <h3 className={styles.itemName}>
                                            {item.common_name !== "Unknown" ? item.common_name : item.scientific_name}
                                        </h3>
                                        <p className={styles.itemScientific}>{item.scientific_name}</p>
                                        <p className={styles.itemCategory}>{item.category}</p>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <div className={styles.quantityControls}>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => decrementQuantity(item.unique_id)}
                                            >
                                                −
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => incrementQuantity(item.unique_id)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.unique_id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className={styles.summary}>
                            <h2>Order Summary</h2>
                            <div className={styles.summaryRow}>
                                <span>Total Plants</span>
                                <span>{totalItems}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Categories</span>
                                <span>{new Set(cartItems.map(i => i.category)).size}</span>
                            </div>
                            <p className={styles.note}>
                                Prices will be confirmed when you order via WhatsApp based on availability.
                            </p>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappBtn}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Order via WhatsApp
                            </a>
                            <button className={styles.clearBtn} onClick={clearCart}>
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
