"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreVertical, Play, Square } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    category: string;
    price: number;
    stock: number;
    images: string[];
    isOnSale?: boolean;
    salePrice?: number;
  };
  totalSales?: number;
  onRefresh?: () => void;
}

export default function ProductCard({ product, totalSales = 1269, onRefresh }: ProductCardProps) {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [salePrice, setSalePrice] = useState(product.salePrice || product.price * 0.8);
  const [loading, setLoading] = useState(false);
  
  const sold = totalSales;
  const remaining = product.stock;
  const total = sold + remaining;
  const soldPercentage = (sold / total) * 100;

  const handleStartSale = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/start-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ salePrice })
      });
      
      if (response.ok) {
        setShowSaleModal(false);
        onRefresh?.();
      }
    } catch (error) {
      console.error('Failed to start sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSale = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/end-sale`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        onRefresh?.();
      }
    } catch (error) {
      console.error('Failed to end sale:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="product-card">
        <div className="product-card-header">
          <div className="product-image-container">
            <div className="product-image-wrapper">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="product-image"
                />
              ) : (
                <div className="product-image-placeholder"></div>
              )}
              {product.isOnSale && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">SALE</span>
              )}
            </div>
          </div>
          <button className="product-menu-btn">
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="product-card-body">
          <h3 className="product-card-title">{product.title}</h3>
          <p className="product-card-category">{product.category}</p>
          <div className="flex items-center gap-2">
            <p className="product-card-price">₹{product.isOnSale && product.salePrice ? product.salePrice : product.price}</p>
            {product.isOnSale && product.salePrice && (
              <p className="text-sm text-gray-500 line-through">₹{product.price}</p>
            )}
          </div>

          <div className="product-summary">
            <h4 className="summary-title">Summary</h4>
            <p className="summary-description">
              Lorem ipsum is placeholder text commonly used in the graphic
            </p>

            <div className="summary-stats">
              <div className="stat-row">
                <span className="stat-label">Sales</span>
                <div className="stat-value-row">
                  <span className="stat-icon">↑</span>
                  <span className="stat-number">{sold}</span>
                </div>
              </div>

              <div className="stat-row">
                <span className="stat-label">Remaining Products</span>
                <div className="stat-value-row">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${100 - soldPercentage}%` }}
                    ></div>
                  </div>
                  <span className="stat-number">{remaining}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {!product.isOnSale ? (
              <button
                onClick={() => setShowSaleModal(true)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Play size={14} /> Start Sale
              </button>
            ) : (
              <button
                onClick={handleEndSale}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Square size={14} /> End Sale
              </button>
            )}
          </div>
        </div>
      </div>

      {showSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Start Sale for {product.title}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (Original: ₹{product.price})
              </label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max={product.price}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSale}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
