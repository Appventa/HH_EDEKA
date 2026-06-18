import { Ionicons } from '@expo/vector-icons';

export const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Fleisch: 'restaurant-outline',
  Fisch: 'fish-outline',
  'Obst & Gemüse': 'leaf-outline',
  Molkereiprodukte: 'egg-outline',
  Backwaren: 'cafe-outline',
  'Öle & Saucen': 'flask-outline',
  Tiefkühl: 'snow-outline',
  Getränke: 'water-outline',
};

export const DEFAULT_CATEGORY_ICON: keyof typeof Ionicons.glyphMap = 'pricetag-outline';
