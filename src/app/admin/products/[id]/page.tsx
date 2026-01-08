"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, Upload } from "lucide-react";
import Breadcrumb from "@/components/admin/Breadcrumb";
import Image from "next/image";

interface ProductData {
  title: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  stock: number;
  price: number;
  salePrice: number;
  tags: string[];
  images: string[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    title: "",
    description: "",
    category: "",
    brand: "",
    sku: "",
    stock: 0,
    price: 0,
    salePrice: 0,
    tags: [],
    images: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (params.id && params.id !== "add") {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setProductData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          brand: data.brand || "",
          sku: data.sku || "",
          stock: data.stock || 0,
          price: data.price || 0,
          salePrice: data.salePrice || 0,
          tags: data.tags || [],
          images: data.images || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', productData.title);
      formData.append('description', productData.description);
      formData.append('category', productData.category);
      formData.append('stock', productData.stock.toString());
      formData.append('price', productData.price.toString());
      formData.append('salePrice', productData.salePrice.toString());
      formData.append('tags', JSON.stringify(productData.tags));
      formData.append('loyaltyType', 'MONEY');
      
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const url = params.id && params.id !== "add"
        ? `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/products`;

      const method = params.id && params.id !== "add" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
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
            { label: "Product Details" },
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
              Product Name
            </label>
            <input
              type="text"
              name="title"
              value={productData.title}
              onChange={handleInputChange}
              placeholder="Lorem Ipsum"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              placeholder="Lorem Ipsum Is A Dummy Text"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Category and Brand */}
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
                placeholder="Sneaker"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                name="brand"
                value={productData.brand}
                onChange={handleInputChange}
                placeholder="Addidas"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SKU and Stock */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={productData.sku}
                onChange={handleInputChange}
                placeholder="#32A53"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={productData.stock}
                onChange={handleInputChange}
                placeholder="211"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Regular Price and Sale Price */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Price
              </label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                placeholder="₹110.40"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price
              </label>
              <input
                type="number"
                name="salePrice"
                value={productData.salePrice}
                onChange={handleInputChange}
                placeholder="₹450"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag
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
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add tag"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="space-y-6">
          {/* Product Preview */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Product Preview
            </h3>
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              {productData.images[0] ? (
                <Image
                  src={productData.images[0]}
                  alt="Product preview"
                  width={300}
                  height={300}
                  className="rounded-lg object-cover"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>
          </div>

          {/* Product Gallery */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Product Gallery
            </h3>
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-blue-500">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Drop your images here, or browse
              </p>
              <p className="text-xs text-gray-500">Jpeg, png are allowed (Max 5 images)</p>
            </label>

            {/* Selected Images */}
            {imageFiles.length > 0 && (
              <div className="space-y-3 mt-4">
                {imageFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-900">{file.name}</span>
                    </div>
                    <button
                      onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing Images */}
            {productData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Current Images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {productData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square">
                      <Image
                        src={img}
                        alt={`Product ${i + 1}`}
                        fill
                        className="rounded object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary px-12"
        >
          {loading ? "Saving..." : "UPDATE"}
        </button>
        {params.id && params.id !== "add" && (
          <button onClick={handleDelete} className="btn-danger px-12">
            DELETE
          </button>
        )}
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
