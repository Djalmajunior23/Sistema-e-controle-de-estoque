import { Timestamp } from 'firebase/firestore';

export type MovementType = 'in' | 'out';

export interface Product {
  id?: string;
  name: string;
  type: string;
  material?: string;
  size?: string;
  weight?: string;
  quantity: number;
  minStock: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Movement {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  type: MovementType;
  responsible: string;
  date: Timestamp;
}

export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  criticalProducts: Product[];
}
