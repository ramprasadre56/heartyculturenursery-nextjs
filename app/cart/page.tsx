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
                            <Link href="/checkout" className={styles.checkoutBtn}>
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
