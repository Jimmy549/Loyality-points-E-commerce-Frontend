"use client";

import { useState, useEffect } from "react";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { productsService } from "@/lib/services/products.service";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: [],
    priceMin: 0,
    priceMax: 1000,
    colors: [],
    sizes: [],
    styles: []
  });
  const [sortBy, setSortBy] = useState("most-popular");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsService.getProducts({
        page,
        limit: 9,
        category: filters.category.length > 0 ? filters.category.join(',') : undefined
      });
      setProducts(response.products || []);
      const totalCount = response.total || response.products?.length || 0;
      setTotalPages(Math.ceil(totalCount / 9) || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters onApply={handleApplyFilters} />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">Shop</h1>
                <MobileFilters onApply={handleApplyFilters} />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {products.length} Products
                </span>
                <div className="flex items-center">
                  Sort by:{" "}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Most Popular</SelectItem>
                      <SelectItem value="low-price">Low Price</SelectItem>
                      <SelectItem value="high-price">High Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : (
              <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id || product._id} data={product} />
                ))}
              </div>
            )}
            
            {!loading && products.length === 0 && (
              <div className="text-center py-12 text-gray-500">No products found</div>
            )}
            
            <hr className="border-t-black/10" />
            <Pagination className="justify-between">
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className="border border-black/10 cursor-pointer" 
              />
              <PaginationContent>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setPage(i + 1)}
                      className="text-black/50 font-medium text-sm cursor-pointer"
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                className="border border-black/10 cursor-pointer" 
              />
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
}
