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
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  date: string;
  branchId: string;
  total: number;
  items: InvoiceItem[];
}

export interface CustomerCard {
  customerNumber: string;
  businessName: string;
  validUntil: string;
}
