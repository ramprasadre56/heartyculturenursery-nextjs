// Category definitions for the plant nursery
export const PLANT_CATEGORIES = [
  { name: "Flowering Shrubs", slug: "flowering-shrubs", icon: "🌸" },
  { name: "Draceana Varieties", slug: "draceana-varieties", icon: "🌴" },
  { name: "Cordyline Varieties", slug: "cordyline-varieties", icon: "🌿" },
  { name: "Philodendron Varieties", slug: "philodendron-varieties", icon: "💚" },
  { name: "Water Lilies & Lotus", slug: "water-lilies-lotus", icon: "🪷" },
  { name: "Aquatic Plants", slug: "aquatic-plants", icon: "🌊" },
  { name: "Heliconia Varieties", slug: "heliconia-varieties", icon: "🔥" },
  { name: "Plumeria Varieties", slug: "plumeria-varieties", icon: "⭐" },
  { name: "Climbers & Creepers", slug: "climbers-creepers", icon: "🌱" },
  { name: "Fruit Varieties", slug: "fruit-varieties", icon: "🍎" },
  { name: "Ginger Varieties", slug: "ginger-varieties", icon: "✨" },
  { name: "Calathea Varieties", slug: "calathea-varieties", icon: "🎨" },
  { name: "Ornamental Musa", slug: "ornamental-musa", icon: "🍌" },
  { name: "Palm Varieties", slug: "palm-varieties", icon: "🌴" },
  { name: "Herbal & Medicinal", slug: "herbal-medicinal", icon: "💊" },
  { name: "Sacred Trees", slug: "sacred-trees", icon: "🌳" },
  { name: "Tree Species", slug: "tree-species", icon: "🌲" },
  { name: "Coconut Varieties", slug: "coconut-varieties", icon: "🥥" },
  { name: "Mango Varieties", slug: "mango-varieties", icon: "🥭" },
  { name: "Banana Varieties", slug: "banana-varieties", icon: "🍌" },
  { name: "Commercial Timber", slug: "commercial-timber", icon: "🪓" },
];

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
