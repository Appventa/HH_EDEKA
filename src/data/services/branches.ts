import { BrandId } from '@/brands';

import edekaBranches from '../mock/edeka-foodservice/branches.json';
import handelshofBranches from '../mock/handelshof/branches.json';
import { Branch } from '../types';
import { delay } from './delay';

const BRANCHES: Record<BrandId, Branch[]> = {
  'edeka-foodservice': edekaBranches,
  handelshof: handelshofBranches,
};

export async function getBranches(brandId: BrandId): Promise<Branch[]> {
  await delay();
  return BRANCHES[brandId];
}

export async function getBranchById(brandId: BrandId, branchId: string): Promise<Branch | undefined> {
  await delay();
  return BRANCHES[brandId].find((branch) => branch.id === branchId);
}
