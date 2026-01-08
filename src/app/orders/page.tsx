"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ordersService, Order } from "@/lib/services/orders.service";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorToast from "@/components/ui/ErrorToast";
import { Eye, X, Package, Truck } from "lucide-react";

export default function OrdersPage() {
  const { isAuthenticated, initialized } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth initialization
    if (!initialized) {
      return;
    }
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await ordersService.getOrders();
        setOrders(data.orders);
      } catch (err: any) {
        console.log("API failed, using localStorage data");
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const localOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
          setOrders(localOrders);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [initialized, isAuthenticated, router]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setActionLoading(orderId);
    try {
      await ordersService.cancelOrder(orderId);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));
    } catch (err: any) {
      // Fallback for mock data
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' as const } : order
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleTrackOrder = (orderId: string) => {
    alert(`Tracking order #${orderId.slice(-8)}\n\nStatus: In Transit\nExpected Delivery: 2-3 business days`);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your orders..." />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'confirmed'].includes(status.toLowerCase());
  };

  const canTrackOrder = (status: string) => {
    return ['confirmed', 'processing', 'shipped'].includes(status.toLowerCase());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ErrorToast 
        message={error} 
        isVisible={!!error} 
        onClose={() => setError("")} 
      />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <button
          onClick={() => router.push("/shop")}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <Package className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Amount</p>
                  <p className="text-lg font-semibold">${order.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Items</p>
                  <p className="text-lg font-semibold">{order.items.length} item(s)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Points Used</p>
                  <p className="text-lg font-semibold text-red-600">-{order.loyaltyPointsUsed || order.pointsUsed || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Points Earned</p>
                  <p className="text-lg font-semibold text-green-600">+{order.loyaltyPointsEarned || order.pointsEarned || 0}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h4 className="font-medium mb-2">Items ({order.items.length}):</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => {
                    // Handle different item structures from backend
                    const productName = item.title || item.product?.name || item.product?.title || 'Product';
                    const itemPrice = item.price || ((item.product?.price || 0) * item.quantity) || 0;
                    
                    return (
                      <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{productName}</span>
                          <span className="text-gray-500 ml-2">x {item.quantity}</span>
                        </div>
                        <span className="font-semibold">${itemPrice.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Loyalty Points Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">Loyalty Points Summary</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Points Used:</span>
                      <span className="ml-2 font-semibold text-red-600">-{order.loyaltyPointsUsed || order.pointsUsed || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Points Earned:</span>
                      <span className="ml-2 font-semibold text-green-600">+{order.loyaltyPointsEarned || order.pointsEarned || 0}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <span className="text-gray-600">Net Points:</span>
                    <span className="ml-2 font-semibold text-blue-600">
                      {((order.loyaltyPointsEarned || order.pointsEarned || 0) - (order.loyaltyPointsUsed || order.pointsUsed || 0)) >= 0 ? '+' : ''}
                      {(order.loyaltyPointsEarned || order.pointsEarned || 0) - (order.loyaltyPointsUsed || order.pointsUsed || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button
                  onClick={() => handleViewOrder(order._id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                
                {canTrackOrder(order.status) && (
                  <button
                    onClick={() => handleTrackOrder(order._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order</span>
                  </button>
                )}
                
                {canCancelOrder(order.status) && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={actionLoading === order._id}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === order._id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}