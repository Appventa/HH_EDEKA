export interface Branch {
  id: string;
  name: string;
  street: string;
  zip: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  hours: { day: string; time: string }[];
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  discountPercent?: number;
  validUntil: string;
  branchIds: string[];
  imageId: string;
}

export interface Product {
  ean: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  imageId: string;
  /** Branch IDs where this product is currently in stock. Empty array = not available. */
  availableBranchIds: string[];
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  branchId: string;
  total: number;
  items: InvoiceItem[];
}

export interface CustomerCard {
  customerNumber: string;
  businessName: string;
  holderName: string;
  validUntil: string;
  /** Delivery address for "Lieferung anfragen". */
  address: string;
}

export interface Loyalty {
  totalSpend: number;
}

export interface PackagingUnit {
  type: string;
  gtin: string;
  quantity?: number;
  grossWeight: string;
  netWeight: string;
  dimensions: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchasedQuantity: number;
  existingStock: number;
  purchaseNote: string;
  productImageId?: string;
}

export interface PosIngredient {
  inventoryItemId: string;
  amountPerServing: number;
}

export interface PosDishEntry {
  id: string;
  dishName: string;
  soldCount: number;
  ingredients: PosIngredient[];
}

export interface PosReport {
  date: string;
  totalRevenue?: number;
  entries: PosDishEntry[];
}

export interface ProductDetail {
  imageId: string;
  manufacturer: string;
  manufacturerAddress: string;
  brandLabel: string;
  productGroup: string;
  productSubgroup: string;
  manufacturerGroup: string;
  sources: string;
  shelfLife: string;
  storageInfo: string;
  preparation?: string;
  customsTariffNumber: string;
  dietaryInfo: string;
  salesUnit: PackagingUnit;
  singleUnit: PackagingUnit;
}
