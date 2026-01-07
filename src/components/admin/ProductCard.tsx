import Link from "next/link";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    category: string;
    price: number;
    stock: number;
    images: string[];
  };
  totalSales?: number;
}

export default function ProductCard({ product, totalSales = 1269 }: ProductCardProps) {
  const sold = totalSales;
  const remaining = product.stock;
  const total = sold + remaining;
  const soldPercentage = (sold / total) * 100;

  return (
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
          </div>
        </div>
        <button className="product-menu-btn">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-category">{product.category}</p>
        <p className="product-card-price">₹{product.price}</p>

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
      </div>
    </div>
  );
}
