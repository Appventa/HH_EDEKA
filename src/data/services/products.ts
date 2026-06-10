import { BrandId } from '@/brands';

import edekaProducts from '../mock/edeka-foodservice/products.json';
import handelshofProducts from '../mock/handelshof/products.json';
import { Product } from '../types';
import { delay } from './delay';

const PRODUCTS: Record<BrandId, Product[]> = {
  'edeka-foodservice': edekaProducts,
  handelshof: handelshofProducts,
};

export async function getProducts(brandId: BrandId): Promise<Product[]> {
  await delay();
  return PRODUCTS[brandId];
}

export async function getProductByEAN(brandId: BrandId, ean: string): Promise<Product | undefined> {
  await delay();
  return PRODUCTS[brandId].find((product) => product.ean === ean);
}
