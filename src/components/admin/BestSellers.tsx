"use client";

interface BestSellersProps {
  products?: any[];
}

export default function BestSellers({ products }: BestSellersProps) {
  // Sample data matching Figma design
  const bestSellingProducts = products || [
    {
      id: 1,
      name: "Lorem Ipsum",
      price: "₹126.50",
      originalPrice: "₹126,500",
      sales: "999 sales"
    },
    {
      id: 2,
      name: "Lorem Ipsum",
      price: "₹126.50",
      originalPrice: "₹126,500",
      sales: "999 sales"
    },
    {
      id: 3,
      name: "Lorem Ipsum",
      price: "₹126.50",
      originalPrice: "₹126,500",
      sales: "999 sales"
    }
  ];

  return (
    <div className="best-sellers">
      <div className="best-sellers-header">
        <h3 className="best-sellers-title">Best Sellers</h3>
        <button className="menu-btn">⋮</button>
      </div>

      <div className="best-sellers-list">
        {bestSellingProducts.map((product) => (
          <div key={product.id} className="best-seller-item">
            <div className="product-image-wrapper">
              <div className="product-image-placeholder"></div>
            </div>
            <div className="product-info">
              <div className="product-details">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-original-price">{product.originalPrice}</p>
                <p className="product-sales">{product.sales}</p>
              </div>
              <div className="product-price-section">
                <p className="product-price">{product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="report-btn">REPORT</button>
    </div>
  );
}
