import { BrandId } from '@/brands';

import edekaCard from '../mock/edeka-foodservice/customer-card.json';
import handelshofCard from '../mock/handelshof/customer-card.json';
import { CustomerCard } from '../types';
import { delay } from './delay';

const CARDS: Record<BrandId, CustomerCard> = {
  'edeka-foodservice': edekaCard,
  handelshof: handelshofCard,
};

export async function getCustomerCard(brandId: BrandId): Promise<CustomerCard> {
  await delay();
  return CARDS[brandId];
}
