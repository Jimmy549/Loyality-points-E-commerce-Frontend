"use client";

import { useEffect, useState } from "react";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { Product } from "@/types/product.types";
import { useParams } from "next/navigation";
import { productsService } from "@/lib/services/products.service";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string[];
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    if (slug?.[0]) {
      fetchProduct(slug[0]);
    }
  }, [slug]);

  const fetchProduct = async (id: string) => {
    try {
      const product = await productsService.getProductById(id);
      setProductData(product);
      
      // Fetch related products
      const related = await productsService.getProducts({ limit: 4 });
      setRelatedProducts(related.products || []);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </main>
    );
  }

  if (!productData) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-4">Product ID: {slug?.[0]}</p>
          <a href="/" className="text-blue-600 hover:underline">Go back to home</a>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <ProductListSec title="You might also like" data={relatedProducts} />
      </div>
    </main>
  );
}