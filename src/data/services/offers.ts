import { BrandId } from '@/brands';

import edekaOffers from '../mock/edeka-foodservice/offers.json';
import handelshofOffers from '../mock/handelshof/offers.json';
import { Offer } from '../types';
import { delay } from './delay';

const OFFERS: Record<BrandId, Offer[]> = {
  'edeka-foodservice': edekaOffers,
  handelshof: handelshofOffers,
};

export async function getOffers(brandId: BrandId): Promise<Offer[]> {
  await delay();
  return OFFERS[brandId];
}

export async function getOfferCategories(brandId: BrandId): Promise<string[]> {
  await delay();
  const categories = new Set(OFFERS[brandId].map((offer) => offer.category));
  return Array.from(categories);
}

export function getOfferByImageId(imageId: string, brandId: string): Offer | undefined {
  const offers = OFFERS[brandId as BrandId] ?? [];
  return offers.find((o) => o.imageId === imageId);
}
