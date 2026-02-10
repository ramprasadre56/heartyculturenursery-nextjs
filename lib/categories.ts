// Grouped category definitions for the plant nursery
export interface CategoryItem {
  name: string;
  slug: string;
  icon: string;
}

export interface CategoryGroup {
  group: string;
  items: CategoryItem[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: "Trees & Timber",
    items: [
      { name: "Sacred Trees", slug: "sacred-trees", icon: "🌳" },
      { name: "Tree Species", slug: "tree-species", icon: "🌲" },
      { name: "Commercial Timber", slug: "commercial-timber", icon: "🪓" },
      { name: "Palm Varieties", slug: "palm-varieties", icon: "🌴" },
    ],
  },
  {
    group: "Fruits",
    items: [
      { name: "Fruit Varieties", slug: "fruit-varieties", icon: "🍎" },
      { name: "Mango Varieties", slug: "mango-varieties", icon: "🥭" },
      { name: "Coconut Varieties", slug: "coconut-varieties", icon: "🥥" },
      { name: "Banana Varieties", slug: "banana-varieties", icon: "🍌" },
    ],
  },
  {
    group: "Tropical & Ornamental",
    items: [
      { name: "Heliconia Varieties", slug: "heliconia-varieties", icon: "🔥" },
      { name: "Plumeria Varieties", slug: "plumeria-varieties", icon: "⭐" },
      { name: "Draceana Varieties", slug: "draceana-varieties", icon: "🌴" },
      { name: "Cordyline Varieties", slug: "cordyline-varieties", icon: "🌿" },
    ],
  },
  {
    group: "Foliage & Indoor",
    items: [
      { name: "Philodendron Varieties", slug: "philodendron-varieties", icon: "💚" },
      { name: "Calathea Varieties", slug: "calathea-varieties", icon: "🎨" },
      { name: "Ornamental Musa", slug: "ornamental-musa", icon: "🍌" },
      { name: "Ginger Varieties", slug: "ginger-varieties", icon: "✨" },
    ],
  },
  {
    group: "Garden & Specialty",
    items: [
      { name: "Climbers & Creepers", slug: "climbers-creepers", icon: "🌱" },
      { name: "Water Lilies & Lotus", slug: "water-lilies-lotus", icon: "🪷" },
      { name: "Aquatic Plants", slug: "aquatic-plants", icon: "🌊" },
      { name: "Herbal & Medicinal", slug: "herbal-medicinal", icon: "💊" },
    ],
  },
  {
    group: "Flowers",
    items: [
      { name: "Flowering Shrubs", slug: "flowering-shrubs", icon: "🌸" },
    ],
  },
];

// Flat list for backwards compatibility (sidebar, navbar, etc.)
export const PLANT_CATEGORIES: CategoryItem[] = CATEGORY_GROUPS.flatMap(g => g.items);

// Map category name to slug for data filtering
export const CATEGORY_MAP: Record<string, string> = {
  "Flowering Shrubs": "flowering-shrubs",
  "Draceana Varieties": "draceana-varieties",
  "Cordyline Varieties": "cordyline-varieties",
  "Philodendron Varieties": "philodendron-varieties",
  "Water Lilies & Lotus": "water-lilies-lotus",
  "Aquatic Plants": "aquatic-plants",
  "Heliconia Varieties": "heliconia-varieties",
  "Plumeria Varieties": "plumeria-varieties",
  "Climbers & Creepers": "climbers-creepers",
  "Fruit Varieties": "fruit-varieties",
  "Ginger Varieties": "ginger-varieties",
  "Calathea Varieties": "calathea-varieties",
  "Ornamental Musa": "ornamental-musa",
  "Palm Varieties": "palm-varieties",
  "Herbal & Medicinal": "herbal-medicinal",
  "Sacred Trees": "sacred-trees",
  "Tree Species": "tree-species",
  "Coconut Varieties": "coconut-varieties",
  "Mango Varieties": "mango-varieties",
  "Banana Varieties": "banana-varieties",
  "Commercial Timber": "commercial-timber",
};

// Reverse map from slug to category name
export const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);

export function getCategoryBySlug(slug: string) {
  return PLANT_CATEGORIES.find(cat => cat.slug === slug);
}
