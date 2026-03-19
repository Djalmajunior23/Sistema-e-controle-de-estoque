import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from '../firebase';
import { Product, Movement, MovementType } from '../types';

const PRODUCTS_COLLECTION = 'products';
const MOVEMENTS_COLLECTION = 'movements';

export const inventoryService = {
  // Products
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      callback(products);
    }, (error) => {
      console.error("Error subscribing to products:", error);
    });
  },

  addProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Timestamp.now();
    return await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      createdAt: now,
      updatedAt: now
    });
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    return await updateDoc(productRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  deleteProduct: async (id: string) => {
    return await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  },

  // Movements
  subscribeToMovements: (callback: (movements: Movement[]) => void) => {
    const q = query(collection(db, MOVEMENTS_COLLECTION), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const movements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Movement[];
      callback(movements);
    }, (error) => {
      console.error("Error subscribing to movements:", error);
    });
  },

  recordMovement: async (
    productId: string, 
    productName: string, 
    quantity: number, 
    type: MovementType, 
    responsible: string,
    currentStock: number,
    notes?: string
  ) => {
    const newStock = type === 'in' ? currentStock + quantity : currentStock - quantity;
    
    if (newStock < 0) {
      throw new Error("O estoque não pode ser negativo.");
    }

    const now = Timestamp.now();
    
    // 1. Record the movement
    await addDoc(collection(db, MOVEMENTS_COLLECTION), {
      productId,
      productName,
      quantity,
      type,
      responsible,
      date: now,
      notes: notes || null
    });

    // 2. Update product stock
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      quantity: newStock,
      updatedAt: now
    });
  }
};
