import globalInventory from '../mock/shared/inventory.json';
import globalPosReport from '../mock/shared/pos-report.json';
import { InventoryItem, PosReport } from '../types';
import { delay } from './delay';

// Inventory and POS data are global to the user's business —
// not tied to which brand store they purchased from.
export async function getInventory(): Promise<InventoryItem[]> {
  await delay();
  return globalInventory as InventoryItem[];
}

export async function getPosReport(): Promise<PosReport> {
  await delay();
  return globalPosReport as PosReport;
}

// ─── purchase → inventory link resolution ────────────────────────────
// Maps product name patterns to inventory item IDs and how many
// inventory units one cart unit adds (e.g. 1 Eimer Avocados = 12 Stück).

const PURCHASE_LINKS: Array<[RegExp, string, number]> = [
  [/avocado/i, 'inv-avocado', 12],
  [/mozzarella/i, 'inv-mozzarella', 1000],
  [/feta/i, 'inv-feta', 500],
  [/eier|eggs?/i, 'inv-eier', 12],
  [/champignon/i, 'inv-champignons', 500],
  [/speck|pancetta|bacon/i, 'inv-speck', 500],
  [/tomat/i, 'inv-tomaten', 1000],
  [/(weiß|weiss)wein/i, 'inv-weisswein', 750],
  [/pasta|spaghetti|nudel/i, 'ef-pasta', 5000],
  [/rinderfilet|rindfilet/i, 'ef-rinderfilet', 1000],
  [/lachs/i, 'ef-lachs', 1000],
  [/parmesan/i, 'ef-parmesan', 1000],
  [/sahne/i, 'ef-sahne', 1000],
  [/butter/i, 'ef-butter', 250],
  [/olivenöl|olivenoel/i, 'ef-olivenoel', 1000],
  [/brühe|bruehe/i, 'ef-bruehe', 1000],
];

export function resolvePurchaseLinks(
  cartItems: Array<{ title: string; quantity: number }>,
): Array<{ inventoryItemId: string; quantity: number }> {
  return cartItems.flatMap((item) => {
    for (const [pattern, id, unitQty] of PURCHASE_LINKS) {
      if (pattern.test(item.title)) {
        return [{ inventoryItemId: id, quantity: item.quantity * unitQty }];
      }
    }
    return [];
  });
}

// ─── shared computation ───────────────────────────────────────────────

export interface InventoryStatus {
  item: InventoryItem;
  totalStock: number;
  usedToday: number;
  remaining: number;
  pct: number;
  daysRemaining: number;
}

export function computeStatus(
  items: InventoryItem[],
  report: PosReport,
  additions: Record<string, number> = {},
): InventoryStatus[] {
  const consumed: Record<string, number> = {};
  for (const dish of report.entries) {
    for (const ing of dish.ingredients) {
      consumed[ing.inventoryItemId] = (consumed[ing.inventoryItemId] ?? 0) + dish.soldCount * ing.amountPerServing;
    }
  }
  return items
    .map((item) => {
      const totalStock = item.purchasedQuantity + item.existingStock + (additions[item.id] ?? 0);
      const usedToday = consumed[item.id] ?? 0;
      const remaining = Math.max(0, totalStock - usedToday);
      const pct = totalStock > 0 ? Math.min(100, (remaining / totalStock) * 100) : 0;
      const daysRemaining = usedToday > 0 ? remaining / usedToday : Infinity;
      return { item, totalStock, usedToday, remaining, pct, daysRemaining };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}
