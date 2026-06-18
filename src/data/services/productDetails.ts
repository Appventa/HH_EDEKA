import { BrandId } from '@/brands';

import edekaDetails from '../mock/edeka-foodservice/product-details.json';
import handelshofDetails from '../mock/handelshof/product-details.json';
import { ProductDetail } from '../types';
import { delay } from './delay';

const PRODUCT_DETAILS: Record<BrandId, ProductDetail[]> = {
  'edeka-foodservice': edekaDetails,
  handelshof: handelshofDetails,
};

export async function getProductDetail(brandId: BrandId, imageId: string): Promise<ProductDetail | undefined> {
  await delay();
  return PRODUCT_DETAILS[brandId].find((item) => item.imageId === imageId);
}
