"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { refreshUserData } from "@/lib/features/auth/authSlice";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated } =useAppSelector((state) => state.auth);

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setError("Invalid payment session");
      setVerifying(false);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Verify payment with backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/verify/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Payment verification failed");
      }

      const data = await response.json();
      
      if (data.paymentStatus === "paid" || data.paymentStatus === "complete") {
        setSuccess(true);
        setOrderDetails(data.order);
        
        // Refresh user data to get updated loyalty points
        await dispatch(refreshUserData());
        
        // Clear cart
        await dispatch(clearCart());
        
        // Clear checkout data
        localStorage.removeItem("checkoutData");
      } else {
        setError("Payment is still processing. Please check your orders page.");
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setError(err.message || "Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Verifying Your Payment
          </h2>
          <p className="text-gray-600">Please wait while we confirm your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/orders")}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              View My Orders
            </Button>
            <Button
              onClick={() => router.push("/shop")}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-600 mb-4">
          Your payment has been confirmed and your order is being processed.
        </p>

        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">
                  #{orderDetails._id?.slice(-8) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  ${orderDetails.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
              {orderDetails.pointsUsed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Used:</span>
                  <span className="font-medium text-red-600">
                    -{orderDetails.pointsUsed}
                  </span>
                </div>
              )}
              {orderDetails.pointsEarned > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Earned:</span>
                  <span className="font-medium text-green-600">
                    +{orderDetails.pointsEarned}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/orders")}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
          >
            View My Orders
          </Button>
          <Button
            onClick={() => router.push("/shop")}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
