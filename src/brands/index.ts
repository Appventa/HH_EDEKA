import { edekaFoodservice } from './edeka-foodservice';
import { handelshof } from './handelshof';
import { BrandConfig, BrandId } from './types';

export const brands: Record<BrandId, BrandConfig> = {
  'edeka-foodservice': edekaFoodservice,
  handelshof: handelshof,
};

export const brandList: BrandConfig[] = [edekaFoodservice, handelshof];

export * from './types';
