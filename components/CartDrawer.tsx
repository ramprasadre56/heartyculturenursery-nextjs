"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatSizeDisplay } from '@/lib/data';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
    const {
        cartItems,
        isOpen,
        totalItems,
        closeCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
    } = useCart();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className={styles.backdrop} onClick={closeCart}></div>

            {/* Drawer */}
            <div className={styles.drawer}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                        </svg>
                        Your Cart ({totalItems})
                    </h2>
                    <button className={styles.closeButton} onClick={closeCart}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Cart Items */}
                <div className={styles.items}>
                    {cartItems.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                                <circle cx="8" cy="21" r="1"></circle>
                                <circle cx="19" cy="21" r="1"></circle>
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                            </svg>
                            <p>Your cart is empty</p>
                            <Link href="/plants" className={styles.browseLink} onClick={closeCart}>
                                Browse Plants
                            </Link>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.unique_id} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.common_name || item.scientific_name}
                                            width={80}
                                            height={80}
                                            className={styles.image}
                                        />
                                    )}
                                </div>
                                <div className={styles.itemDetails}>
                                    <h4 className={styles.itemName}>
                                        {item.common_name !== "Unknown" ? item.common_name : item.scientific_name}
                                    </h4>
                                    <p className={styles.itemScientific}>{item.scientific_name}</p>
                                    <p className={styles.itemCategory}>{item.category}</p>
                                    {item.sizeSelection && (
                                        <p className={styles.itemSize}>{formatSizeDisplay(item.sizeSelection)}</p>
                                    )}
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
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className={styles.footer}>
                        <Link href="/cart" className={styles.viewCartBtn} onClick={closeCart}>
                            View Cart
                        </Link>
                        <Link href="/checkout" className={styles.checkoutBtn} onClick={closeCart}>
                            Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
