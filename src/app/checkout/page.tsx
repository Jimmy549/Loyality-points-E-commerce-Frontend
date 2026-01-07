"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { updateUser, refreshUserData } from "@/lib/features/auth/authSlice";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { Button } from "@/components/ui/button";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { CreditCard, MapPin, CheckCircle } from "lucide-react";
import { ordersService } from "@/lib/services/orders.service";

interface CheckoutData {
  subtotal: number;
  discount: number;
  pointsUsed: number;
  pointsDiscount: number;
  total: number;
  promoCode: string;
}

export default function CheckoutPage() {
  const { isAuthenticated, user, initialized } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: user?.name || ""
  });
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [errors, setErrors] = useState({
    shipping: {} as any,
    payment: {} as any
  });

  const validateShippingAddress = () => {
    const newErrors: any = {};
    
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) newErrors.email = 'Email is invalid';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[\+]?[1-9][\d]{0,15}$/.test(shippingAddress.phone.replace(/[\s\-\(\)]/g, ''))) newErrors.phone = 'Phone number is invalid';
    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(shippingAddress.zipCode)) newErrors.zipCode = 'ZIP code is invalid';
    
    setErrors(prev => ({ ...prev, shipping: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentDetails = () => {
    const newErrors: any = {};
    
    if (!paymentDetails.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    if (!paymentDetails.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Card number is invalid';
    if (!paymentDetails.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiryDate)) newErrors.expiryDate = 'Expiry date must be MM/YY format';
    if (!paymentDetails.cvv.trim()) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(paymentDetails.cvv)) newErrors.cvv = 'CVV must be 3-4 digits';
    
    setErrors(prev => ({ ...prev, payment: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  useEffect(() => {
    // Wait for auth initialization before checking authentication
    if (!initialized) {
      return; // Wait for auth to initialize
    }
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const data = localStorage.getItem('checkoutData');
    if (data) {
      setCheckoutData(JSON.parse(data));
    } else {
      router.push("/cart");
    }
  }, [initialized, isAuthenticated, router]);

  const handlePlaceOrder = async () => {
    // Validate forms
    const isShippingValid = validateShippingAddress();
    const isPaymentValid = validatePaymentDetails();
    
    if (!isShippingValid || !isPaymentValid) {
      alert('Please fix the errors in the form before proceeding.');
      return;
    }
    
    setLoading(true);
    try {
      // Skip user data refresh to avoid permission errors
      // await dispatch(refreshUserData());
      
      // Create order data for backend
      const orderData = {
        pointsToUse: checkoutData?.pointsUsed || 0,
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country
        },
        paymentMethod: 'credit_card' as const,
        paymentDetails: {
          ...paymentDetails,
          cardNumber: paymentDetails.cardNumber.replace(/\s/g, '') // Remove spaces
        },
        userDetails: {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone
        }
      };
      
      // Create order via API
      const orderResult = await ordersService.createOrder(orderData);
      console.log('Order created:', orderResult);
      
      // Update user's loyalty points
      if (user && checkoutData) {
        const pointsEarned = Math.floor(checkoutData.total);
        const newPoints = user.loyaltyPoints - checkoutData.pointsUsed + pointsEarned;
        dispatch(updateUser({ loyaltyPoints: newPoints }));
      }
      
      // Clear checkout data and cart
      localStorage.removeItem('checkoutData');
      dispatch(clearCart());
      
      // Show success popup
      setOrderId(orderResult._id);
      setShowSuccess(true);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Order placement failed';
      console.error('Order placement failed:', errorMessage);
      
      // Show user-friendly error message
      if (errorMessage.includes('Insufficient points')) {
        alert('You don\'t have enough loyalty points for this purchase. Please reduce the points used or add more items to earn points.');
      } else if (errorMessage.includes('Cart is empty')) {
        alert('Your cart is empty. Please add items to your cart before checkout.');
      } else if (errorMessage.includes('stock')) {
        alert('Some items in your cart are out of stock. Please review your cart.');
      } else {
        alert('Order placement failed. Please try again or contact support if the problem persists.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your order #{orderId.slice(-8)} has been confirmed.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/orders')}
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
                >
                  View My Orders
                </Button>
                <Button
                  onClick={() => router.push('/shop')}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h1 className={cn([integralCF.className, "text-3xl font-bold mb-8"])}>
        Checkout
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={shippingAddress.fullName}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, fullName: e.target.value});
                    if (errors.shipping.fullName) {
                      setErrors(prev => ({...prev, shipping: {...prev.shipping, fullName: ''}}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.shipping.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.shipping.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.shipping.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={shippingAddress.email}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, email: e.target.value});
                    if (errors.shipping.email) {
                      setErrors(prev => ({...prev, shipping: {...prev.shipping, email: ''}}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.shipping.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.shipping.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.shipping.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, phone: e.target.value});
                    if (errors.shipping.phone) {
                      setErrors(prev => ({...prev, shipping: {...prev.shipping, phone: ''}}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.shipping.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                  required
                />
                {errors.shipping.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.shipping.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  autoComplete="street-address"
                  value={shippingAddress.street}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, street: e.target.value});
                    if (errors.shipping.street) {
                      setErrors(prev => ({...prev, shipping: {...prev.shipping, street: ''}}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.shipping.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.shipping.street && (
                  <p className="text-red-500 text-xs mt-1">{errors.shipping.street}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  autoComplete="address-level2"
                  value={shippingAddress.city}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, city: e.target.value});
                    if (errors.shipping.city) {
                      setErrors(prev => ({...prev, shipping: {...prev.shipping, city: ''}}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.shipping.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.shipping.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.shipping.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  autoComplete="address-level1"
                  value={shippingAddress.state}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, state: e.target.value});
                    if (errors.shipping.state) {
                      setErrors(prev => ({...prev, shipping: {...prev.shipping, state: ''}}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.shipping.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.shipping.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.shipping.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  autoComplete="postal-code"
                  value={shippingAddress.zipCode}
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, zipCode: e.target.value});
                    if (errors.shipping.zipCode) {
                      setErrors(prev => ({...prev, shipping: {...prev.shipping, zipCode: ''}}));
                    }
                  }}
                  placeholder="12345"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.shipping.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.shipping.zipCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.shipping.zipCode}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  autoComplete="country"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  autoComplete="cc-name"
                  value={paymentDetails.cardholderName}
                  onChange={(e) => {
                    setPaymentDetails({...paymentDetails, cardholderName: e.target.value});
                    if (errors.payment.cardholderName) {
                      setErrors(prev => ({...prev, payment: {...prev.payment, cardholderName: ''}}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.payment.cardholderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.payment.cardholderName && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment.cardholderName}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number *
                </label>
                <input
                  type="text"
                  autoComplete="cc-number"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setPaymentDetails({...paymentDetails, cardNumber: formatted});
                    if (errors.payment.cardNumber) {
                      setErrors(prev => ({...prev, payment: {...prev.payment, cardNumber: ''}}));
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.payment.cardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.payment.cardNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment.cardNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  autoComplete="cc-exp"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setPaymentDetails({...paymentDetails, expiryDate: formatted});
                    if (errors.payment.expiryDate) {
                      setErrors(prev => ({...prev, payment: {...prev.payment, expiryDate: ''}}));
                    }
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.payment.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.payment.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment.expiryDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  autoComplete="cc-csc"
                  value={paymentDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                    setPaymentDetails({...paymentDetails, cvv: value});
                    if (errors.payment.cvv) {
                      setErrors(prev => ({...prev, payment: {...prev.payment, cvv: ''}}));
                    }
                  }}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.payment.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.payment.cvv && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment.cvv}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${checkoutData.subtotal}</span>
            </div>
            {checkoutData.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">-${checkoutData.discount}</span>
              </div>
            )}
            {checkoutData.pointsDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Points Discount ({checkoutData.pointsUsed} pts)</span>
                <span className="font-medium text-green-600">-${checkoutData.pointsDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${checkoutData.total}</span>
            </div>
          </div>
          
          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}