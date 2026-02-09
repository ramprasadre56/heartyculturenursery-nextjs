export interface BagCategory {
  category: 'Small' | 'Medium' | 'Large' | 'Extra Large';
  label: string;
  coverSize: string;
  weightRange: string;
  description: string;
  icon: string;
  bags: { size: string; weightKg: number }[];
}

export interface PolyPackCategory {
  category: 'Ornamental/Retail' | 'Architectural';
  label: string;
  description: string;
  icon: string;
  packs: { size: string; label: string; weightKg: number }[];
}

export const GROW_BAG_CATEGORIES: BagCategory[] = [
  {
    category: 'Small',
    label: 'Small (Seedling)',
    coverSize: '4x5 to 6x7 inches',
    weightRange: '0.5 - 1 Kg',
    description: 'Perfect for seedlings, starter plants, and small herb propagation.',
    icon: '\u{1F331}',
    bags: [
      { size: '4x5', weightKg: 0.5 },
      { size: '5x7', weightKg: 0.7 },
      { size: '6x7', weightKg: 1 },
    ],
  },
  {
    category: 'Medium',
    label: 'Medium (Primary Growth)',
    coverSize: '8x10 to 12x12 inches',
    weightRange: '3 - 10 Kg',
    description: 'Ideal for established saplings, flowering shrubs, and medium ornamentals.',
    icon: '\u{1F33F}',
    bags: [
      { size: '7x8', weightKg: 1.5 },
      { size: '8x10', weightKg: 4 },
      { size: '12x12', weightKg: 10 },
    ],
  },
  {
    category: 'Large',
    label: 'Large (Specimen Stock)',
    coverSize: '15x16 to 18x18 inches',
    weightRange: '18 - 35 Kg',
    description: 'For specimen trees, large palms, and mature fruit trees.',
    icon: '\u{1F333}',
    bags: [
      { size: '15x16', weightKg: 20 },
      { size: '18x18', weightKg: 35 },
    ],
  },
  {
    category: 'Extra Large',
    label: 'Extra Large (Instant Greenery)',
    coverSize: '21x21 to 30x30 inches',
    weightRange: '55 - 180 Kg',
    description: 'Mature landscape-ready trees for instant garden impact.',
    icon: '\u{1F3E1}',
    bags: [
      { size: '21x21', weightKg: 50 },
      { size: '25x25', weightKg: 100 },
      { size: '30x30', weightKg: 180 },
    ],
  },
];

export const POLY_PACK_CATEGORIES: PolyPackCategory[] = [
  {
    category: 'Ornamental/Retail',
    label: 'Ornamental / Retail Range',
    description: 'Standard retail sizes for seasonal flowers, herbs, indoor plants, and gift plants.',
    icon: '\u{1FAB4}',
    packs: [
      { size: '4" pp', label: 'Liner Pack', weightKg: 0.5 },
      { size: '5" pp', label: '', weightKg: 1.5 },
      { size: '6" pp', label: '', weightKg: 2 },
      { size: '8" pp', label: 'Retail Pot', weightKg: 4.5 },
    ],
  },
  {
    category: 'Architectural',
    label: 'Architectural Range',
    description: 'Large-format pots for architectural plants like Fiddle Leaf Figs, Monstera, and landscape specimens.',
    icon: '\u{1F332}',
    packs: [
      { size: '10" pp', label: 'Advanced Growth Pack', weightKg: 6 },
      { size: '12" pp', label: '', weightKg: 10 },
      { size: '14" pp', label: '', weightKg: 15 },
      { size: '16" pp', label: '', weightKg: 20 },
      { size: '18" pp', label: '', weightKg: 35 },
      { size: '20" pp', label: 'Advanced Growth Pack', weightKg: 80 },
    ],
  },
];

export const WEIGHT_DISCLAIMER = 'Weights are based on standard wet soil mix. Soilless media will be lighter.';
