export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export type Language = 'en' | 'ky' | 'ru';

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  currency: string;
  language: Language;
}

export type AppView = 'pos' | 'inventory' | 'history' | 'settings' | 'reports';
