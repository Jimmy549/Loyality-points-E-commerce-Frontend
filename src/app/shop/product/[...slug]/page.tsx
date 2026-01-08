"use client";

import { allProductsData, relatedProductData } from "@/data/products";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { Product } from "@/types/product.types";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string[];
  
  const productData = useMemo(() => {
    if (!slug || !slug[0]) return null;
    const id = Number(slug[0]);
    return allProductsData.find((p) => p.id === id);
  }, [slug]);

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
        <ProductListSec title="You might also like" data={relatedProductData} />
      </div>
    </main>
  );
}