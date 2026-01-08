"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

interface AddressForm {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    pincode: string;
    notes: string;
}

export default function CheckoutPage() {
    const { cartItems, totalItems, clearCart } = useCart();
    const [form, setForm] = useState<AddressForm>({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        pincode: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Partial<AddressForm>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof AddressForm]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<AddressForm> = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }
        if (!form.address.trim()) newErrors.address = 'Address is required';
        if (!form.city.trim()) newErrors.city = 'City is required';
        if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateWhatsAppMessage = () => {
        let message = "🌿 *Horticulture Nursery Order*\n\n";

        message += "📋 *Order Details:*\n";
        cartItems.forEach((item, index) => {
            const name = item.common_name !== "Unknown" ? item.common_name : item.scientific_name;
            message += `${index + 1}. *${name}* × ${item.quantity}\n`;
        });
        message += `\n📦 *Total Items:* ${totalItems}\n\n`;

        message += "👤 *Customer Details:*\n";
        message += `Name: ${form.name}\n`;
        message += `Phone: ${form.phone}\n`;
        if (form.email) message += `Email: ${form.email}\n`;
        message += `\n📍 *Delivery Address:*\n`;
        message += `${form.address}\n`;
        message += `${form.city} - ${form.pincode}\n`;

        if (form.notes) {
            message += `\n📝 *Notes:* ${form.notes}\n`;
        }

        message += "\n🙏 Please confirm availability and total amount. Thank you!";

        return encodeURIComponent(message);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const whatsappNumber = "918919029601";
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;

        window.open(whatsappLink, '_blank');
    };

    const handleClearAndOrder = () => {
        if (!validateForm()) return;

        const whatsappNumber = "918919029601";
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;

        clearCart();
        window.open(whatsappLink, '_blank');
    };

    if (cartItems.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyCheckout}>
                    <span className={styles.emptyIcon}>🛒</span>
                    <h2>Your cart is empty</h2>
                    <p>Add some plants before checking out!</p>
                    <Link href="/plants" className={styles.browseLink}>
                        Browse Plants
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className="page-header">
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>›</span>
                    <Link href="/cart">Cart</Link>
                    <span>›</span>
                    <span>Checkout</span>
                </div>
                <div className="page-title-row">
                    <div className="page-icon">✅</div>
                    <h1 className="page-title">Checkout</h1>
                </div>
            </div>

            <div className={styles.content}>
                {/* Delivery Form */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>📍 Delivery Details</h2>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className={errors.name ? styles.inputError : ''}
                                />
                                {errors.name && <span className={styles.error}>{errors.name}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    className={errors.phone ? styles.inputError : ''}
                                />
                                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email (Optional)</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="address">Delivery Address *</label>
                            <textarea
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="House/Flat No., Street, Landmark"
                                rows={3}
                                className={errors.address ? styles.inputError : ''}
                            />
                            {errors.address && <span className={styles.error}>{errors.address}</span>}
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="city">City *</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className={errors.city ? styles.inputError : ''}
                                />
                                {errors.city && <span className={styles.error}>{errors.city}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="pincode">Pincode *</label>
                                <input
                                    type="text"
                                    id="pincode"
                                    name="pincode"
                                    value={form.pincode}
                                    onChange={handleChange}
                                    placeholder="6-digit pincode"
                                    className={errors.pincode ? styles.inputError : ''}
                                />
                                {errors.pincode && <span className={styles.error}>{errors.pincode}</span>}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="notes">Order Notes (Optional)</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Any special instructions for your order..."
                                rows={2}
                            />
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className={styles.summarySection}>
                    <h2 className={styles.sectionTitle}>🛒 Order Summary</h2>

                    <div className={styles.orderItems}>
                        {cartItems.map((item) => (
                            <div key={item.unique_id} className={styles.orderItem}>
                                <div className={styles.itemImage}>
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.common_name || item.scientific_name}
                                            width={60}
                                            height={60}
                                            className={styles.image}
                                        />
                                    )}
                                </div>
                                <div className={styles.itemInfo}>
                                    <h4>{item.common_name !== "Unknown" ? item.common_name : item.scientific_name}</h4>
                                    <p>{item.category}</p>
                                </div>
                                <div className={styles.itemQty}>×{item.quantity}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summaryTotal}>
                        <span>Total Items</span>
                        <span>{totalItems}</span>
                    </div>

                    <div className={styles.priceNote}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4M12 8h.01"></path>
                        </svg>
                        <span>Prices will be confirmed via WhatsApp based on availability</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleClearAndOrder}
                        className={styles.whatsappBtn}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Place Order via WhatsApp
                    </button>

                    <Link href="/cart" className={styles.backLink}>
                        ← Back to Cart
                    </Link>
                </div>
            </div>
        </div>
    );
}
