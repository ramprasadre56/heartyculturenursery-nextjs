"use client";

export interface SeedCategory {
    name: string;
    slug: string;
    icon: string;
}

export const SEED_CATEGORIES: SeedCategory[] = [
    { name: 'Flower Seeds', slug: 'flower-seeds', icon: '🌸' },
    { name: 'Vegetables Seeds', slug: 'vegetables-seeds', icon: '🥬' },
    { name: 'Herbs Seeds', slug: 'herbs-seeds', icon: '🌿' },
    { name: 'Fruits Seeds', slug: 'fruits-seeds', icon: '🍎' },
];

export const SEED_CATEGORY_MAP: Record<string, SeedCategory> = SEED_CATEGORIES.reduce((acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
}, {} as Record<string, SeedCategory>);

export function getSeedCategoryBySlug(slug: string): SeedCategory | undefined {
    return SEED_CATEGORY_MAP[slug];
}
