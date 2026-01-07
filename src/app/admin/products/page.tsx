"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/admin/ProductCard";
import Pagination from "@/components/admin/Pagination";
import Breadcrumb from "@/components/admin/Breadcrumb";

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  category: string;
  isOnSale: boolean;
  salePrice?: number;
  loyaltyType: "MONEY" | "POINTS" | "HYBRID";
  images: string[];
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?page=${currentPage}`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 10);
      } else {
        console.error("Failed to fetch products:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "All Products" },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <h1 className="page-title">All Products</h1>
          <button
            onClick={() => router.push("/admin/products/add")}
            className="btn-primary"
          >
            <Plus size={20} />
            ADD NEW PRODUCT
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}