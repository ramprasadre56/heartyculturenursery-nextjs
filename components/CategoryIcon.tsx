"use client";

import {
  TreePine,
  Trees,
  Axe,
  Palmtree,
  Apple,
  Cherry,
  CircleDot,
  Banana,
  Flame,
  Star,
  Leaf,
  Sprout,
  Heart,
  Palette,
  Sparkles,
  Flower,
  Droplets,
  Waves,
  Pill,
  Flower2,
  Salad,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  // Trees & Timber
  "sacred-trees": Trees,
  "tree-species": TreePine,
  "commercial-timber": Axe,
  "palm-varieties": Palmtree,
  // Fruits
  "fruit-varieties": Apple,
  "mango-varieties": Cherry,
  "coconut-varieties": CircleDot,
  "banana-varieties": Banana,
  // Tropical & Ornamental
  "heliconia-varieties": Flame,
  "plumeria-varieties": Star,
  "draceana-varieties": Palmtree,
  "cordyline-varieties": Leaf,
  // Foliage & Indoor
  "philodendron-varieties": Heart,
  "calathea-varieties": Palette,
  "ornamental-musa": Banana,
  "ginger-varieties": Sparkles,
  // Garden & Specialty
  "climbers-creepers": Sprout,
  "water-lilies-lotus": Flower,
  "aquatic-plants": Waves,
  "herbal-medicinal": Pill,
  // Flowers
  "flowering-shrubs": Flower2,
  // Seeds
  "flower-seeds": Flower2,
  "vegetables-seeds": Salad,
  "herbs-seeds": Leaf,
  "fruits-seeds": Apple,
};

interface CategoryIconProps {
  slug: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon({ slug, size = 18, className }: CategoryIconProps) {
  const Icon = ICON_MAP[slug] || Leaf;
  return <Icon size={size} className={className} />;
}
