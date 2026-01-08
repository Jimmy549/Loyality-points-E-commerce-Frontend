"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { apiClient } from "@/lib/api/config";

interface SaleTriggerProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
  isOnSale: boolean;
  currentSalePrice?: number;
  onSuccess?: () => void;
}

export default function SaleTrigger({
  productId,
  productTitle,
  currentPrice,
  isOnSale,
  currentSalePrice,
  onSuccess
}: SaleTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [salePrice, setSalePrice] = useState(currentSalePrice || currentPrice * 0.8);
  const [loading, setLoading] = useState(false);

  const handleStartSale = async () => {
    if (salePrice >= currentPrice) {
      alert("Sale price must be less than original price");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/products/${productId}/start-sale`, { salePrice });
      alert(`Sale started! All users will be notified about ${productTitle}`);
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      alert("Failed to start sale");
    } finally {
      setLoading(false);
    }
  };

  const handleEndSale = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/products/${productId}/end-sale`);
      alert("Sale ended successfully");
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      alert("Failed to end sale");
    } finally {
      setLoading(false);
    }
  };

  const discount = Math.round(((currentPrice - salePrice) / currentPrice) * 100);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
          isOnSale
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        <Tag className="w-4 h-4" />
        <span>{isOnSale ? 'End Sale' : 'Start Sale'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {isOnSale ? 'End Sale' : 'Start Sale'}
              </h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">Product: <strong>{productTitle}</strong></p>
              <p className="text-gray-600">Original Price: <strong>${currentPrice}</strong></p>
            </div>

            {!isOnSale ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                    step="0.01"
                    max={currentPrice}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Discount: {discount}% off
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-yellow-800">
                    🔔 All users will receive a real-time notification when you start this sale!
                  </p>
                </div>

                <button
                  onClick={handleStartSale}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Starting Sale...' : 'Start Sale & Notify Users'}
                </button>
              </>
            ) : (
              <>
                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-red-800">
                    Current sale price: <strong>${currentSalePrice}</strong>
                  </p>
                </div>

                <button
                  onClick={handleEndSale}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Ending Sale...' : 'End Sale'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
