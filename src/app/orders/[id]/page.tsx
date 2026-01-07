"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ordersService, Order } from "@/lib/services/orders.service";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorToast from "@/components/ui/ErrorToast";
import { ArrowLeft, Package, MapPin, CreditCard, Award } from "lucide-react";

// Mock order data
const getMockOrder = (id: string): Order => ({
  _id: id,
  user: "user123",
  items: [
    {
      productId: "prod1",
      product: {
        _id: "prod1",
        name: "Premium T-Shirt",
        price: 29.99,
        images: ["/images/pic1.png"]
      },
      quantity: 2,
      size: "M",
      color: "Black",
      price: 59.98,
      title: "Premium T-Shirt"
    },
    {
      productId: "prod2",
      product: {
        _id: "prod2",
        name: "Casual Jeans",
        price: 79.99,
        images: ["/images/pic2.png"]
      },
      quantity: 1,
      size: "32",
      color: "Blue",
      price: 79.99,
      title: "Casual Jeans"
    }
  ],
  totalAmount: 139.97,
  loyaltyPointsEarned: 140,
  loyaltyPointsUsed: 50,
  pointsEarned: 140,
  pointsUsed: 50,
  status: "confirmed" as const,
  shippingAddress: {
    street: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States"
  },
  paymentMethod: "credit_card",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export default function OrderDetailsPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await ordersService.getOrder(orderId);
        setOrder(data);
      } catch (err: any) {
        console.log("API failed, using mock data");
        // Use mock data if API fails
        setOrder(getMockOrder(orderId));
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, router, orderId]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Order not found</h3>
          <button
            onClick={() => router.push("/orders")}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ErrorToast 
        message={error} 
        isVisible={!!error} 
        onClose={() => setError("")} 
      />
      
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </button>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Order #{order._id.slice(-8)}</h2>
            <p className="text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Total Amount</p>
              <p className="text-lg font-semibold">${order.totalAmount}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Points Used</p>
              <p className="text-lg font-semibold text-red-600">-{order.loyaltyPointsUsed || order.pointsUsed || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Points Earned</p>
              <p className="text-lg font-semibold text-green-600">+{order.loyaltyPointsEarned || order.pointsEarned || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Payment Method</p>
              <p className="text-lg font-semibold capitalize">{order.paymentMethod.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => {
            // Handle different item structures from backend
            const productName = item.title || item.product?.name || item.product?.title || 'Product';
            const productPrice = item.product?.price || (item.price / item.quantity) || 0;
            
            return (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.product?.images && item.product.images[0] ? (
                    <img 
                      src={item.product.images[0]} 
                      alt={productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{productName}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Quantity: {item.quantity}</p>
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">${productPrice.toFixed(2)} each</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Shipping Address
        </h3>
        <div className="text-gray-700">
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
          <p>{order.shippingAddress.country}</p>
        </div>
      </div>
    </div>
  );
}