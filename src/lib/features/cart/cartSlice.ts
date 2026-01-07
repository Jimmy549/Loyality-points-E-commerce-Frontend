import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  srcUrl: string;
  stock: number;
  paymentType: 'money' | 'points' | 'hybrid';
  pointsPrice?: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  pointsTotal: number;
  itemCount: number;
  showAddToCartPopup: boolean;
  lastAddedItem: CartItem | null;
}

const initialState: CartState = {
  items: [],
  total: 0,
  pointsTotal: 0,
  itemCount: 0,
  showAddToCartPopup: false,
  lastAddedItem: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.size === action.payload.size && 
        item.color === action.payload.color
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      state.showAddToCartPopup = true;
      state.lastAddedItem = action.payload;
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    hideAddToCartPopup: (state) => {
      state.showAddToCartPopup = false;
      state.lastAddedItem = null;
    },
    
    removeFromCart: (state, action: PayloadAction<{ id: number; size?: string; color?: string }>) => {
      state.items = state.items.filter(item => 
        !(item.id === action.payload.id && 
          item.size === action.payload.size && 
          item.color === action.payload.color)
      );
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number; size?: string; color?: string }>) => {
      const item = state.items.find(item => 
        item.id === action.payload.id && 
        item.size === action.payload.size && 
        item.color === action.payload.color
      );
      
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter(i => i !== item);
        }
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.pointsTotal = 0;
      state.itemCount = 0;
    },
    
    calculateTotals: (state) => {
      state.total = state.items.reduce((sum, item) => {
        if (item.paymentType === 'money' || item.paymentType === 'hybrid') {
          return sum + (item.price * item.quantity);
        }
        return sum;
      }, 0);
      
      state.pointsTotal = state.items.reduce((sum, item) => {
        if (item.paymentType === 'points' || item.paymentType === 'hybrid') {
          return sum + ((item.pointsPrice || item.price) * item.quantity);
        }
        return sum;
      }, 0);
      
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      return initialState;
    });
  },
});

export const { addToCart, hideAddToCartPopup, removeFromCart, updateQuantity, clearCart, calculateTotals } = cartSlice.actions;
export default cartSlice.reducer;