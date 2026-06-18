import { BrandId } from '@/brands';

import edekaLoyalty from '../mock/edeka-foodservice/loyalty.json';
import handelshofLoyalty from '../mock/handelshof/loyalty.json';
import { Loyalty } from '../types';
import { delay } from './delay';

const LOYALTY: Record<BrandId, Loyalty> = {
  'edeka-foodservice': edekaLoyalty,
  handelshof: handelshofLoyalty,
};

export async function getLoyalty(brandId: BrandId): Promise<Loyalty> {
  await delay();
  return LOYALTY[brandId];
}
