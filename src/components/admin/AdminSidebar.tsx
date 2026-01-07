"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const menuItems = [
    {
      name: "DASHBOARD",
      icon: LayoutDashboard,
      path: "/admin",
      exact: true
    },
    {
      name: "ALL PRODUCTS",
      icon: Package,
      path: "/admin/products"
    },
    {
      name: "ORDER LIST",
      icon: ShoppingBag,
      path: "/admin/orders"
    }
  ];

  const categories = [
    { name: "Lorem Ipsum", count: 21 },
    { name: "Lorem Ipsum", count: 32 },
    { name: "Lorem Ipsum", count: 13 },
    { name: "Lorem Ipsum", count: 14 },
    { name: "Lorem Ipsum", count: 66 },
    { name: "Lorem Ipsum", count: 11 }
  ];

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.path;
    }
    return pathname.startsWith(item.path);
  };

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-container">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path d="M20 5L35 15V25L20 35L5 25V15L20 5Z" fill="white" opacity="0.3"/>
            <path d="M20 10L30 17V27L20 34L10 27V17L20 10Z" fill="white"/>
          </svg>
          <span className="logo-text">Arik</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon className="nav-icon" size={20} />
              <span className="nav-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Categories Section */}
      <div className="sidebar-categories">
        <button
          className="categories-header"
          onClick={() => setCategoriesOpen(!categoriesOpen)}
        >
          <span className="categories-title">Categories</span>
          {categoriesOpen ? (
            <ChevronUp size={16} className="chevron-icon" />
          ) : (
            <ChevronDown size={16} className="chevron-icon" />
          )}
        </button>

        {categoriesOpen && (
          <div className="categories-list">
            {categories.map((category, index) => (
              <div key={index} className="category-item">
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
