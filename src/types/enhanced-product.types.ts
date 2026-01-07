export interface Product {
  _id?: string;  // MongoDB ObjectId from backend
  id?: number;   // Legacy numeric ID for mock data
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
  saleStartDate?: string;
  saleEndDate?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
}