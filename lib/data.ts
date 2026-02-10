// Plant data types and loading utilities

export interface Plant {
    id: number;
    global_id?: number;
    scientific_name: string;
    common_name: string;
    category: string;
    page?: number;
    image?: string;
}

export interface SizeSelection {
    containerType: 'grow_bag' | 'pp_pot';
    size: string;
    weightKg: number;
    categoryLabel: string;
}

export interface CartItem extends Plant {
    quantity: number;
    unique_id: string;
    sizeSelection?: SizeSelection;
}

// Cache for loaded plants
let plantsCache: Plant[] | null = null;

// Load all plants from the consolidated JSON file
export async function loadPlants(): Promise<Plant[]> {
    if (plantsCache) return plantsCache;

    try {
        const response = await fetch('/data/plants.json');
        if (!response.ok) throw new Error('Failed to load plants');
        plantsCache = await response.json();
        return plantsCache || [];
    } catch (error) {
        console.error('Error loading plants:', error);
        return [];
    }
}

// Load plants by category - filters from the consolidated JSON
export async function loadPlantsByCategory(categorySlug: string): Promise<Plant[]> {
    const allPlants = await loadPlants();
    const categoryName = slugToCategoryName(categorySlug);

    const filtered = allPlants.filter(p =>
        p.category.toLowerCase() === categoryName.toLowerCase()
    );

    console.log(`Found ${filtered.length} plants for category: ${categoryName}`);
    return filtered;
}

// Convert slug to category name
function slugToCategoryName(slug: string): string {
    const mapping: Record<string, string> = {
        'flowering-shrubs': 'Flowering Shrubs',
        'draceana-varieties': 'Draceana Varieties',
        'cordyline-varieties': 'Cordyline Varieties',
        'philodendron-varieties': 'Philodendron Varieties',
        'water-lilies-lotus': 'Water Lilies & Lotus',
        'aquatic-plants': 'Aquatic Plants',
        'heliconia-varieties': 'Heliconia Varieties',
        'plumeria-varieties': 'Plumeria Varieties',
        'climbers-creepers': 'Climbers & Creepers',
        'fruit-varieties': 'Fruit Varieties',
        'ginger-varieties': 'Ginger Varieties',
        'calathea-varieties': 'Calathea Varieties',
        'ornamental-musa': 'Ornamental Musa Varieties',
        'palm-varieties': 'Palm Varieties',
        'herbal-medicinal': 'Herbal & Medicinal',
        'sacred-trees': 'Sacred Trees',
        'tree-species': 'Tree Species',
        'coconut-varieties': 'Coconut Varieties',
        'mango-varieties': 'Mango Varieties',
        'banana-varieties': 'Banana Plant Varieties',
        'commercial-timber': 'Commercial Timber Plants',
        'pineapple-varieties': 'Pineapple Varieties',
    };
    return mapping[slug] || slug;
}

// Get all unique categories from the data
export async function getAllCategories(): Promise<string[]> {
    const allPlants = await loadPlants();
    const categories = [...new Set(allPlants.map(p => p.category))];
    return categories.sort();
}

// Create unique ID for cart items
export function createUniqueId(category: string, id: number, sizeKey?: string): string {
    const base = `${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}_${id}`;
    return sizeKey ? `${base}_${sizeKey}` : base;
}

// Format size selection for display
export function formatSizeDisplay(sel: SizeSelection): string {
    const type = sel.containerType === 'grow_bag' ? 'Grow Bag' : 'PP Pot';
    return `${type} ${sel.size} (${sel.weightKg}kg)`;
}
