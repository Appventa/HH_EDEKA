import { ImageSourcePropType } from 'react-native';

// Maps Offer/Product `imageId` to a real product photo. Only a subset of the
// mock imageIds have a matching photo yet — others fall back to a category icon.
export const PRODUCT_IMAGES: Record<string, ImageSourcePropType> = {
  lachsfilet: require('../../assets/images/products/prod (1).webp'),
  orangensaft: require('../../assets/images/products/prod (2).webp'),
  bier: require('../../assets/images/products/prod (3).webp'),
  rotwein: require('../../assets/images/products/prod (5).webp'),
  gouda: require('../../assets/images/products/prod (6).webp'),
  garnelen: require('../../assets/images/products/prod (7).webp'),
  paprika: require('../../assets/images/products/prod (8).webp'),
  vollkornbrot: require('../../assets/images/products/prod (9).webp'),
  avocado: require('../../assets/images/products/prod (10).webp'),
  ananas: require('../../assets/images/products/prod (11).webp'),
  limetten: require('../../assets/images/products/prod (12).webp'),
  rinderfilet: require('../../assets/images/products/prod (13).webp'),
  putenbrust: require('../../assets/images/products/prod (14).webp'),
  schweinenacken: require('../../assets/images/products/prod (15).webp'),
  sonnenblumenoel: require('../../assets/images/products/Sonnenblummenöl.webp'),
  apfelschorle: require('../../assets/images/products/apfelshorle.webp'),
  broetchen: require('../../assets/images/products/bröttchen.webp'),
  gemuesemix: require('../../assets/images/products/gemüsemix.webp'),
};
