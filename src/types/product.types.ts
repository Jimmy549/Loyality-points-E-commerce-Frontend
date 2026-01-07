export type Discount = {
  amount: number;
  percentage: number;
};

export type Product = {
  _id?: string;  // MongoDB ObjectId from backend
  id?: number;   // Legacy numeric ID for mock data
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
};
