export interface EnhancedProduct {
  _id?: string;
  id?: number;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: {
    amount: number;
    percentage: number;
  };
  rating: number;
  description?: string;
  stock: number;
  paymentType: 'money' | 'points' | 'hybrid';
  pointsPrice?: number;
  isOnSale?: boolean;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
}

export interface Product {
  _id?: string;
  id?: number;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: {
    amount: number;
    percentage: number;
  };
  rating: number;
  description?: string;
  stock: number;
  paymentType: 'money' | 'points' | 'hybrid';
  pointsPrice?: number;
  isOnSale?: boolean;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
}