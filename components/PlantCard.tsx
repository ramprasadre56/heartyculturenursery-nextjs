"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Plant, SizeSelection } from '@/lib/data';
import SizeSelectorModal from './SizeSelectorModal';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import styles from './PlantCard.module.css';

interface PlantCardProps {
    plant: Plant;
    onLoginRequired?: () => void;
}

export default function PlantCard({ plant, onLoginRequired }: PlantCardProps) {
    const { addToCart } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const imageSrc = plant.image || '/heartyculture_catalogue/placeholder.png';

    const handleSelectSize = (plant: Plant, sizeSelection: SizeSelection) => {
        addToCart(plant, sizeSelection);
    };

    const handleSelectSizeClick = () => {
        if (onLoginRequired) {
            onLoginRequired();
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <CardContainer containerClassName="py-0">
            <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl border">
                <div className={styles.card} style={{ border: 'none', borderRadius: 'inherit' }}>
                    <CardItem translateZ="100" className="w-full">
                        <div className={styles.imageContainer}>
                            <Image
                                src={imageSrc}
                                alt={plant.common_name || plant.scientific_name}
                                width={300}
                                height={200}
                                className={styles.image}
                                loading="lazy"
                            />
                            <div className={styles.overlayGradient}></div>
                        </div>
                    </CardItem>

                    <div className={styles.details}>
                        <CardItem translateZ="50" className="w-full">
                            <h3 className={styles.commonName}>
                                {plant.common_name !== "Unknown" ? plant.common_name : plant.scientific_name}
                            </h3>
                        </CardItem>
                        <CardItem translateZ="40" className="w-full">
                            <p className={styles.scientificName}>
                                {plant.scientific_name}
                            </p>
                        </CardItem>

                        <CardItem translateZ={20} className="w-full">
                            <button
                                className={styles.addToCart}
                                onClick={handleSelectSizeClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="8" cy="21" r="1"></circle>
                                    <circle cx="19" cy="21" r="1"></circle>
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                                </svg>
                                <span>Select Size</span>
                            </button>
                        </CardItem>
                    </div>

                    <SizeSelectorModal
                        isOpen={isModalOpen}
                        plant={plant}
                        onClose={() => setIsModalOpen(false)}
                        onSelectSize={handleSelectSize}
                    />
                </div>
            </CardBody>
        </CardContainer>
    );
}
