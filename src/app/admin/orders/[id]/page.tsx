"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  ClipboardList,
  MapPin,
  Calendar,
  ChevronDown,
  Printer,
} from "lucide-react";
import Breadcrumb from "@/components/admin/Breadcrumb";

interface OrderDetails {
  _id: string;
  userId: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod?: string;
  createdAt: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.2;
  const discount = 0;
  const shippingRate = 0;
  const total = subtotal + tax - discount + shippingRate;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin" },
            { label: "Order List", href: "/admin/orders" },
            { label: "Order Details" },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Orders ID: #{order._id.slice(-4)}
            </h1>
            <span className="badge badge-pending">Pending</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Calendar size={16} />
              <span>
                Feb 16,2022 - Feb 20,2022
              </span>
            </button>
            <div className="relative">
              <select className="btn-secondary appearance-none pr-10">
                <option>Change Satus</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
              />
            </div>
            <button className="btn-secondary">
              <Printer size={16} />
            </button>
            <button className="btn-primary">Save</button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Customer Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Full Name: {order.userId.name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Email: {order.userId.email}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Phone: {order.userId.phone || "+91 904 231 1212"}
              </p>
              <button className="btn-primary w-full">View profile</button>
            </div>
          </div>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">Order Info</h3>
              <p className="text-sm text-gray-600 mb-1">
                Shipping: Next express
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Payment Method: {order.paymentMethod || "Paypal"}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Status: {order.status}
              </p>
              <button className="btn-primary w-full">Download info</button>
            </div>
          </div>
        </div>

        {/* Deliver To Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">Deliver to</h3>
              <p className="text-sm text-gray-600 mb-4">
                Address:{" "}
                {order.shippingAddress
                  ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`
                  : "Dharam Colony, Palam Vihar, Gurgaon, Haryana"}
              </p>
              <button className="btn-primary w-full">View profile</button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info and Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Info</h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">●●</span>
            </div>
            <span className="text-sm text-gray-900">Master Card **** **** 6557</span>
          </div>
          <p className="text-sm text-gray-600">Business name: {order.userId.name}</p>
          <p className="text-sm text-gray-600">
            Phone: {order.userId.phone || "+91 904 231 1212"}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Note</h3>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            rows={4}
            placeholder="Type some notes"
          ></textarea>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      <span className="text-sm text-gray-900">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      #{order._id.slice(-6)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-6 border-t border-gray-200">
          <div className="max-w-sm ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (20%)</span>
              <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-gray-900">₹{discount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sipping Rate</span>
              <span className="font-medium text-gray-900">₹{shippingRate}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
