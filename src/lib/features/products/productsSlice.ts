import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { productsService } from "../../services/products.service";
import { EnhancedProduct } from "@/types/enhanced-product.types";

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  paymentType?: string;
  sortBy?: string;
}

type Product = EnhancedProduct;

export type Color = {
  name: string;
  code: string;
};

// Async thunks for API calls
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters?: ProductFilters) => {
    const response = await productsService.getAllProducts(filters);
    return {
      products: response.products,
      totalPages: Math.ceil(response.total / response.limit),
      page: response.page
    };
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id: string) => {
    const response = await productsService.getProduct(id);
    return response;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    const response = await productsService.getAllProducts({ limit: 10 });
    return response.products;
  }
);

// Define a type for the slice state
interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  featuredProducts: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  colorSelection: Color;
  sizeSelection: string;
}

// Define the initial state using that type
const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  featuredProducts: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  colorSelection: {
    name: "Brown",
    code: "bg-[#4F4631]",
  },
  sizeSelection: "Large",
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setColorSelection: (state, action: PayloadAction<Color>) => {
      state.colorSelection = action.payload;
    },
    setSizeSelection: (state, action: PayloadAction<string>) => {
      state.sizeSelection = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch single product
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch featured products';
      });
  },
});

export const { setColorSelection, setSizeSelection, clearCurrentProduct } = productsSlice.actions;

export default productsSlice.reducer;
