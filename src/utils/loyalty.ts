export interface LoyaltyTier {
  threshold: number;
  rate: number;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { threshold: 2500, rate: 10 },
  { threshold: 5000, rate: 12 },
  { threshold: 10000, rate: 15 },
];

export interface LoyaltyStatus {
  currentRate: number;
  cashback: number;
  nextTier: LoyaltyTier | null;
  progress: number;
}

export function getLoyaltyStatus(totalSpend: number): LoyaltyStatus {
  let currentRate = 0;
  let currentThreshold = 0;

  for (const tier of LOYALTY_TIERS) {
    if (totalSpend >= tier.threshold) {
      currentRate = tier.rate;
      currentThreshold = tier.threshold;
    }
  }

  const nextTier = LOYALTY_TIERS.find((tier) => totalSpend < tier.threshold) ?? null;
  const progress = nextTier
    ? (totalSpend - currentThreshold) / (nextTier.threshold - currentThreshold)
    : 1;

  return {
    currentRate,
    cashback: totalSpend * (currentRate / 100),
    nextTier,
    progress: Math.min(Math.max(progress, 0), 1),
  };
}
