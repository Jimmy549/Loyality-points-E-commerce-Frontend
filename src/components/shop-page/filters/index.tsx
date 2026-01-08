import React, { useState } from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import ColorsSection from "@/components/shop-page/filters/ColorsSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import SizeSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";

const Filters = ({ onApply }: { onApply?: (filters: any) => void }) => {
  const [filters, setFilters] = useState({
    category: [],
    priceMin: 0,
    priceMax: 1000,
    colors: [],
    sizes: [],
    styles: []
  });

  const handleCategoryChange = (categories: any) => {
    setFilters(prev => ({ ...prev, category: categories }));
  };

  const handlePriceChange = (min: any, max: any) => {
    setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }));
  };

  const handleColorChange = (colors: any) => {
    setFilters(prev => ({ ...prev, colors }));
  };

  const handleSizeChange = (sizes: any) => {
    setFilters(prev => ({ ...prev, sizes }));
  };

  const handleStyleChange = (styles: any) => {
    setFilters(prev => ({ ...prev, styles }));
  };

  const handleApply = () => {
    if (onApply) {
      onApply(filters);
    }
  };

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection onChange={handleCategoryChange} selected={filters.category} />
      <hr className="border-t-black/10" />
      <PriceSection onChange={handlePriceChange} min={filters.priceMin} max={filters.priceMax} />
      <hr className="border-t-black/10" />
      <ColorsSection onChange={handleColorChange} selected={filters.colors} />
      <hr className="border-t-black/10" />
      <SizeSection onChange={handleSizeChange} selected={filters.sizes} />
      <hr className="border-t-black/10" />
      <DressStyleSection onChange={handleStyleChange} selected={filters.styles} />
      <Button
        type="button"
        onClick={handleApply}
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
      >
        Apply Filter
      </Button>
    </>
  );
};

export default Filters;
