"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Plant, SizeSelection, createUniqueId } from '@/lib/data';

interface CartContextType {
    cartItems: CartItem[];
    isOpen: boolean;
    totalItems: number;
    addToCart: (plant: Plant, sizeSelection: SizeSelection) => void;
    removeFromCart: (uniqueId: string) => void;
    incrementQuantity: (uniqueId: string) => void;
    decrementQuantity: (uniqueId: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'heartyculture_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCartItems(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
        setIsHydrated(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, isHydrated]);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = (plant: Plant, sizeSelection: SizeSelection) => {
        const sizeKey = `${sizeSelection.containerType}-${sizeSelection.size}`;
        const uniqueId = createUniqueId(plant.category, plant.id, sizeKey);

        setCartItems(prev => {
            const existing = prev.find(item => item.unique_id === uniqueId);
            if (existing) {
                return prev.map(item =>
                    item.unique_id === uniqueId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...plant, quantity: 1, unique_id: uniqueId, sizeSelection }];
        });

        setIsOpen(true);
    };

    const removeFromCart = (uniqueId: string) => {
        setCartItems(prev => prev.filter(item => item.unique_id !== uniqueId));
    };

    const incrementQuantity = (uniqueId: string) => {
        setCartItems(prev =>
            prev.map(item =>
                item.unique_id === uniqueId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decrementQuantity = (uniqueId: string) => {
        setCartItems(prev => {
            const item = prev.find(i => i.unique_id === uniqueId);
            if (item && item.quantity <= 1) {
                return prev.filter(i => i.unique_id !== uniqueId);
            }
            return prev.map(i =>
                i.unique_id === uniqueId
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            );
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const toggleCart = () => setIsOpen(prev => !prev);
    const closeCart = () => setIsOpen(false);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                isOpen,
                totalItems,
                addToCart,
                removeFromCart,
                incrementQuantity,
                decrementQuantity,
                clearCart,
                toggleCart,
                closeCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
