import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Product, CartItem, Transaction, StoreSettings, AppView } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initial Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Milk (1L)', price: 2.50, barcode: '123456789', category: 'Dairy', stock: 50 },
  { id: '2', name: 'Bread (Whole Wheat)', price: 3.00, barcode: '987654321', category: 'Bakery', stock: 30 },
  { id: '3', name: 'Eggs (Dozen)', price: 4.50, barcode: '456123789', category: 'Dairy', stock: 40 },
  { id: '4', name: 'Apple (Red)', price: 0.80, barcode: '321654987', category: 'Fruits', stock: 100 },
  { id: '5', name: 'Banana', price: 0.50, barcode: '147258369', category: 'Fruits', stock: 120 },
  { id: '6', name: 'Coffee Beans (500g)', price: 12.00, barcode: '963852741', category: 'Beverages', stock: 15 },
];

const INITIAL_SETTINGS: StoreSettings = {
  name: 'My Retail Store',
  address: '123 Market Street, City Center',
  phone: '+1 234 567 8900',
  currency: '$',
  language: 'en',
};

// State Interface
interface State {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  settings: StoreSettings;
  currentView: AppView;
}

// Actions
type Action =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'COMPLETE_TRANSACTION'; payload: { method: 'cash' | 'card' | 'upi' } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: StoreSettings }
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'LOAD_DATA'; payload: Partial<State> };

// Reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'COMPLETE_TRANSACTION': {
      const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newTransaction: Transaction = {
        id: uuidv4(),
        items: [...state.cart],
        total,
        timestamp: Date.now(),
        paymentMethod: action.payload.method,
      };
      
      // Update stock
      const updatedProducts = state.products.map(p => {
        const cartItem = state.cart.find(c => c.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      });

      return {
        ...state,
        transactions: [newTransaction, ...state.transactions],
        products: updatedProducts,
        cart: [],
      };
    }
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Context
const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    products: INITIAL_PRODUCTS,
    cart: [],
    transactions: [],
    settings: INITIAL_SETTINGS,
    currentView: 'pos',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('pos_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('pos_data', JSON.stringify({
      products: state.products,
      transactions: state.transactions,
      settings: state.settings
    }));
  }, [state.products, state.transactions, state.settings]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
