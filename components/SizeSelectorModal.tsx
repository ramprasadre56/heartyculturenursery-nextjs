"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plant, SizeSelection } from '@/lib/data';
import { GROW_BAG_CATEGORIES, POLY_PACK_CATEGORIES } from '@/lib/plantSizes';
import styles from './SizeSelectorModal.module.css';

interface SizeSelectorModalProps {
    isOpen: boolean;
    plant: Plant;
    onClose: () => void;
    onSelectSize: (plant: Plant, sizeSelection: SizeSelection) => void;
}

type Tab = 'grow_bag' | 'pp_pot';

export default function SizeSelectorModal({ isOpen, plant, onClose, onSelectSize }: SizeSelectorModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('grow_bag');
    const [mounted, setMounted] = useState(false);

    // Ensure we only portal after hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset tab when opening
    useEffect(() => {
        if (isOpen) {
            setActiveTab('grow_bag');
        }
    }, [isOpen]);

    // Escape key to close
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const handleSelect = (sizeSelection: SizeSelection) => {
        onSelectSize(plant, sizeSelection);
        onClose();
    };

    const modalContent = (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Select plant size"
            >
                {/* Close Button */}
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.plantName}>
                        {plant.common_name !== "Unknown" ? plant.common_name : plant.scientific_name}
                    </h2>
                    <p className={styles.scientificName}>{plant.scientific_name}</p>
                </div>

                {/* Tab Switcher */}
                <div className={styles.tabSwitcher}>
                    <button
                        className={`${styles.tab} ${activeTab === 'grow_bag' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('grow_bag')}
                    >
                        Grow Bags
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'pp_pot' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('pp_pot')}
                    >
                        PP Pots
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {activeTab === 'grow_bag' && (
                        <>
                            {GROW_BAG_CATEGORIES.map((cat) => (
                                <div key={cat.category} className={styles.categoryGroup}>
                                    <div className={styles.categoryLabel}>{cat.label}</div>
                                    <div className={styles.sizeGrid}>
                                        {cat.bags.map((bag) => (
                                            <button
                                                key={bag.size}
                                                className={styles.sizeBtn}
                                                onClick={() => handleSelect({
                                                    containerType: 'grow_bag',
                                                    size: bag.size,
                                                    weightKg: bag.weightKg,
                                                    categoryLabel: cat.label,
                                                })}
                                            >
                                                <span className={styles.sizeName}>{bag.size}</span>
                                                <span className={styles.sizeWeight}>{bag.weightKg} kg</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {activeTab === 'pp_pot' && (
                        <>
                            {POLY_PACK_CATEGORIES.map((cat) => (
                                <div key={cat.category} className={styles.categoryGroup}>
                                    <div className={styles.categoryLabel}>{cat.label}</div>
                                    <div className={styles.sizeGrid}>
                                        {cat.packs.map((pack) => (
                                            <button
                                                key={pack.size}
                                                className={styles.sizeBtn}
                                                onClick={() => handleSelect({
                                                    containerType: 'pp_pot',
                                                    size: pack.size,
                                                    weightKg: pack.weightKg,
                                                    categoryLabel: cat.label,
                                                })}
                                            >
                                                <span className={styles.sizeName}>{pack.size}</span>
                                                <span className={styles.sizeWeight}>{pack.weightKg} kg</span>
                                                {pack.label && <span className={styles.sizeLabel}>{pack.label}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
