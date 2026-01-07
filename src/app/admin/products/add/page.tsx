"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, Trash2 } from "lucide-react";
import Breadcrumb from "@/components/admin/Breadcrumb";

interface ProductData {
  title: string;
  description: string;
  category: string;
  stock: number;
  price: number;
  salePrice: number;
  loyaltyType: 'MONEY' | 'POINTS' | 'HYBRID';
  tags: string[];
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    title: "",
    description: "",
    category: "",
    stock: 0,
    price: 0,
    salePrice: 0,
    loyaltyType: 'MONEY',
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !productData.tags.includes(tagInput.trim())) {
      setProductData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProductData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!productData.title.trim()) {
      alert('Product title is required');
      return;
    }
    if (!productData.description.trim()) {
      alert('Product description is required');
      return;
    }
    if (productData.price <= 0) {
      alert('Product price must be greater than 0');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append all product data
      formData.append('title', productData.title);
      formData.append('description', productData.description);
      formData.append('category', productData.category || '');
      formData.append('stock', productData.stock.toString());
      formData.append('price', productData.price.toString());
      formData.append('salePrice', productData.salePrice.toString());
      formData.append('loyaltyType', productData.loyaltyType);
      formData.append('tags', JSON.stringify(productData.tags));
      
      // Append images
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      console.log('Submitting product data:', {
        title: productData.title,
        description: productData.description,
        category: productData.category,
        stock: productData.stock,
        price: productData.price,
        salePrice: productData.salePrice,
        loyaltyType: productData.loyaltyType,
        tags: productData.tags,
        imageCount: selectedFiles.length
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Product created successfully:', result);
        // Clean up preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        alert('Product created successfully!');
        router.push("/admin/products");
      } else {
        const errorText = await response.text();
        console.error("Failed to create product:", errorText);
        let errorMessage = 'Failed to create product. Please try again.';
        try {
          const errorObj = JSON.parse(errorText);
          if (errorObj.message) {
            errorMessage = Array.isArray(errorObj.message) 
              ? errorObj.message.join(', ') 
              : errorObj.message;
          }
        } catch {}
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "All Products", href: "/admin/products" },
            { label: "Add New Product" },
          ]}
        />
        <h1 className="page-title mt-4">Product Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Name */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="title"
              value={productData.title}
              onChange={handleInputChange}
              placeholder="Enter product name (e.g., Wireless Headphones)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 3 characters required</p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              placeholder="Describe your product features, benefits, and specifications"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
          </div>

          {/* Category and Loyalty Type */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                placeholder="e.g., Electronics, Clothing, Books"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - helps organize products</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyalty Type *
              </label>
              <select
                name="loyaltyType"
                value={productData.loyaltyType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="MONEY">Money Only - Pay with cash/card</option>
                <option value="POINTS">Points Only - Pay with loyalty points</option>
                <option value="HYBRID">Hybrid - Pay with money + points</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How customers can purchase this product</p>
            </div>
          </div>

          {/* Stock Quantity */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleInputChange}
              placeholder="Enter available quantity (e.g., 100)"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Number of items available for sale</p>
          </div>

          {/* Regular Price and Sale Price */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Price * (₹)
              </label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                placeholder="Enter price (e.g., 1000)"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Original selling price in rupees</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (₹)
              </label>
              <input
                type="number"
                name="salePrice"
                value={productData.salePrice}
                onChange={handleInputChange}
                placeholder="Enter discounted price (optional)"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - Leave empty if no discount</p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {productData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-gray-300"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags (e.g., wireless, bluetooth, electronics)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                type="button"
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tags help customers find your product easily</p>
          </div>
        </div>

        {/* Image Section */}
        <div className="space-y-6">
          {/* Product Preview */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Product Preview
            </h3>
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrls.length > 0 ? (
                <img
                  src={previewUrls[0]}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>
          </div>

          {/* Product Gallery */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Product Gallery ({selectedFiles.length}/5)
            </h3>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Drop your images here, or browse
              </p>
              <p className="text-xs text-gray-500 mb-3">Jpeg, png are allowed (Max 5 images)</p>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={selectedFiles.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className={`inline-block px-4 py-2 text-sm font-medium rounded-lg cursor-pointer ${
                  selectedFiles.length >= 5
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Choose Files
              </label>
            </div>

            {/* Selected Images */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3 mt-4">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={previewUrls[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-900 truncate max-w-[150px]">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading || !productData.title || !productData.description}
          className="px-12 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "SAVE PRODUCT"}
        </button>
        <button
          onClick={() => router.push("/admin/products")}
          className="btn-secondary px-12"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
