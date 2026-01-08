"use client";

import { useState } from "react";
import { Filter, DollarSign, Award, Zap } from "lucide-react";

interface ProductFilterProps {
  onFilterChange: (filter: {
    loyaltyType?: 'MONEY' | 'POINTS' | 'HYBRID' | 'ALL';
    isOnSale?: boolean;
  }) => void;
}

export default function ProductFilter({ onFilterChange }: ProductFilterProps) {
  const [loyaltyType, setLoyaltyType] = useState<'ALL' | 'MONEY' | 'POINTS' | 'HYBRID'>('ALL');
  const [onSale, setOnSale] = useState(false);

  const handleLoyaltyTypeChange = (type: typeof loyaltyType) => {
    setLoyaltyType(type);
    onFilterChange({
      loyaltyType: type === 'ALL' ? undefined : type,
      isOnSale: onSale || undefined
    });
  };

  const handleSaleToggle = () => {
    const newSaleState = !onSale;
    setOnSale(newSaleState);
    onFilterChange({
      loyaltyType: loyaltyType === 'ALL' ? undefined : loyaltyType,
      isOnSale: newSaleState || undefined
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 mr-2" />
        <h3 className="font-semibold">Filter Products</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Payment Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleLoyaltyTypeChange('ALL')}
              className={`p-3 border rounded-lg text-sm transition-all ${
                loyaltyType === 'ALL'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <Filter className="w-5 h-5 mb-1" />
                <span>All</span>
              </div>
            </button>

            <button
              onClick={() => handleLoyaltyTypeChange('MONEY')}
              className={`p-3 border rounded-lg text-sm transition-all ${
                loyaltyType === 'MONEY'
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <DollarSign className="w-5 h-5 mb-1" />
                <span>Money</span>
              </div>
            </button>

            <button
              onClick={() => handleLoyaltyTypeChange('POINTS')}
              className={`p-3 border rounded-lg text-sm transition-all ${
                loyaltyType === 'POINTS'
                  ? 'border-yellow-500 bg-yellow-500 text-white'
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <Award className="w-5 h-5 mb-1" />
                <span>Points</span>
              </div>
            </button>

            <button
              onClick={() => handleLoyaltyTypeChange('HYBRID')}
              className={`p-3 border rounded-lg text-sm transition-all ${
                loyaltyType === 'HYBRID'
                  ? 'border-purple-500 bg-purple-500 text-white'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <Zap className="w-5 h-5 mb-1" />
                <span>Hybrid</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onSale}
              onChange={handleSaleToggle}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">Show only products on sale</span>
          </label>
        </div>
      </div>

      {(loyaltyType !== 'ALL' || onSale) && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {loyaltyType !== 'ALL' && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {loyaltyType}
              </span>
            )}
            {onSale && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                On Sale
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
