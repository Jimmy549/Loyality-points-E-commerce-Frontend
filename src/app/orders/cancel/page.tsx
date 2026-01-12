"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any pending checkout data after a delay
    const timer = setTimeout(() => {
      // Don't clear checkout data immediately - user might want to retry
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h2>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. Your order has not been placed.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 Your cart items are still saved. You can try checking out again or continue shopping.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/cart")}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
          >
            Return to Cart
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
