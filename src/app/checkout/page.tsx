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
import ErrorPopup from "@/components/ui/ErrorPopup";

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
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, title: "", message: "" });
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'points' | 'hybrid'>('money');
  const [errors, setErrors] = useState({ shipping: {} as any, payment: {} as any });

  // ----------------- VALIDATIONS -----------------
  const validateShippingAddress = () => {
    const newErrors: any = {};
    
    if (!shippingAddress.fullName?.trim()) newErrors.fullName = 'Required';
    if (!shippingAddress.email?.trim()) newErrors.email = 'Required';
    if (!shippingAddress.phone?.trim()) newErrors.phone = 'Required';
    if (!shippingAddress.street?.trim()) newErrors.street = 'Required';
    if (!shippingAddress.city?.trim()) newErrors.city = 'Required';
    if (!shippingAddress.state?.trim()) newErrors.state = 'Required';
    if (!shippingAddress.zipCode?.trim()) newErrors.zipCode = 'Required';
    if (!shippingAddress.country?.trim()) newErrors.country = 'Required';
    
    setErrors(prev => ({ ...prev, shipping: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentDetails = () => {
    const newErrors: any = {};
    if (!paymentDetails.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    if (!paymentDetails.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Card number is invalid';
    if (!paymentDetails.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
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
    for (let i = 0; i < match.length; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  const validateFieldRealtime = (field: string, value: string, type: 'shipping' | 'payment') => {
    let error = '';
    if (!value.trim()) {
      error = `${field} is required`;
    }
    
    setErrors(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: error }
    }));
    return error;
  };

  // ----------------- EFFECT -----------------
  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) return router.push("/auth/login");

    const data = localStorage.getItem('checkoutData');
    if (data) setCheckoutData(JSON.parse(data));
    else router.push("/cart");
  }, [initialized, isAuthenticated, router]);

  // ----------------- PLACE ORDER -----------------
  const handlePlaceOrder = async () => {
    const isShippingValid = validateShippingAddress();

    if (!isShippingValid) {
      setErrorPopup({
        isOpen: true,
        title: "Validation Error",
        message: "Please fill in all shipping address fields."
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Shipping Address State:', shippingAddress);
      
      const orderData: any = {
        pointsToUse: checkoutData?.pointsUsed || 0,
        shippingAddress: {
          street: String(shippingAddress.street || '').trim(),
          city: String(shippingAddress.city || '').trim(),
          state: String(shippingAddress.state || '').trim(),
          postalCode: String(shippingAddress.zipCode || '').trim(),
          country: String(shippingAddress.country || '').trim()
        },
        // Omit paymentMethod to let backend decide based on points used
      };
      
      console.log('Order Data Being Sent:', orderData);

      // Create order and get Stripe checkout URL
      const orderResult = await ordersService.createOrder(orderData);
      console.log('Order created successfully:', orderResult);
      
      // Update user state immediately with deducted points from backend response
      if (orderResult.user && typeof orderResult.user === 'object') {
        dispatch(updateUser(orderResult.user as any));
      } else {
        // Fallback to manual refresh if user object missing or just a string ID
        await dispatch(refreshUserData());
      }

      // Redirect to Stripe Checkout if needed, otherwise show success
      if (orderResult.checkoutUrl) {
        window.location.href = orderResult.checkoutUrl;
      } else {
        // Points-only payment success
        setOrderId(orderResult._id);
        setShowSuccess(true);
        dispatch(clearCart());
        localStorage.removeItem('checkoutData');
        setLoading(false);
      }

    } catch (error: any) {
      console.error('Checkout Error:', error);
      console.error('Error Response:', error.response?.data);
      setErrorPopup({
        isOpen: true,
        title: "Checkout Failed",
        message: error.response?.data?.message || error.message || "Something went wrong"
      });
      setLoading(false);
    }
  };

  if (!checkoutData) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ErrorPopup
        isOpen={errorPopup.isOpen}
        title={errorPopup.title}
        message={errorPopup.message}
        onClose={() => setErrorPopup({ isOpen: false, title: "", message: "" })}
      />

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">Your order #{orderId.slice(-8)} has been confirmed.</p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/orders')} className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800">View My Orders</Button>
              <Button onClick={() => router.push('/shop')} className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300">Continue Shopping</Button>
            </div>
          </div>
        </div>
      )}

      <h1 className={cn([integralCF.className, "text-3xl font-bold mb-8"])}>Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping & Payment form */}
        <div className="space-y-8">
          {/* Shipping */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2" />Shipping Address</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={shippingAddress.fullName} 
                    onChange={(e) => {
                      setShippingAddress({...shippingAddress, fullName: e.target.value});
                      validateFieldRealtime('fullName', e.target.value, 'shipping');
                    }}
                    onBlur={(e) => validateFieldRealtime('fullName', e.target.value, 'shipping')}
                    className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.fullName && "border-red-500")}
                    placeholder="John Doe"
                  />
                  {errors.shipping.fullName && <p className="text-red-500 text-xs mt-1">{errors.shipping.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input 
                    type="email" 
                    value={shippingAddress.email} 
                    onChange={(e) => {
                      setShippingAddress({...shippingAddress, email: e.target.value});
                      validateFieldRealtime('email', e.target.value, 'shipping');
                    }}
                    onBlur={(e) => validateFieldRealtime('email', e.target.value, 'shipping')}
                    className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.email && "border-red-500")}
                    placeholder="john@example.com"
                  />
                  {errors.shipping.email && <p className="text-red-500 text-xs mt-1">{errors.shipping.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input 
                  type="tel" 
                  value={shippingAddress.phone} 
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, phone: e.target.value});
                    validateFieldRealtime('phone', e.target.value, 'shipping');
                  }}
                  onBlur={(e) => validateFieldRealtime('phone', e.target.value, 'shipping')}
                  className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.phone && "border-red-500")}
                  placeholder="+1 234 567 8900"
                />
                {errors.shipping.phone && <p className="text-red-500 text-xs mt-1">{errors.shipping.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input 
                  type="text" 
                  value={shippingAddress.street} 
                  onChange={(e) => {
                    setShippingAddress({...shippingAddress, street: e.target.value});
                    validateFieldRealtime('street', e.target.value, 'shipping');
                  }}
                  onBlur={(e) => validateFieldRealtime('street', e.target.value, 'shipping')}
                  className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.street && "border-red-500")}
                  placeholder="123 Main Street"
                />
                {errors.shipping.street && <p className="text-red-500 text-xs mt-1">{errors.shipping.street}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input 
                    type="text" 
                    value={shippingAddress.city} 
                    onChange={(e) => {
                      setShippingAddress({...shippingAddress, city: e.target.value});
                      validateFieldRealtime('city', e.target.value, 'shipping');
                    }}
                    onBlur={(e) => validateFieldRealtime('city', e.target.value, 'shipping')}
                    className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.city && "border-red-500")}
                    placeholder="New York"
                  />
                  {errors.shipping.city && <p className="text-red-500 text-xs mt-1">{errors.shipping.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input 
                    type="text" 
                    value={shippingAddress.state} 
                    onChange={(e) => {
                      setShippingAddress({...shippingAddress, state: e.target.value});
                      validateFieldRealtime('state', e.target.value, 'shipping');
                    }}
                    onBlur={(e) => validateFieldRealtime('state', e.target.value, 'shipping')}
                    className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.state && "border-red-500")}
                    placeholder="NY"
                  />
                  {errors.shipping.state && <p className="text-red-500 text-xs mt-1">{errors.shipping.state}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                  <input 
                    type="text" 
                    value={shippingAddress.zipCode} 
                    onChange={(e) => {
                      setShippingAddress({...shippingAddress, zipCode: e.target.value});
                      validateFieldRealtime('zipCode', e.target.value, 'shipping');
                    }}
                    onBlur={(e) => validateFieldRealtime('zipCode', e.target.value, 'shipping')}
                    className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.zipCode && "border-red-500")}
                    placeholder="12345"
                  />
                  {errors.shipping.zipCode && <p className="text-red-500 text-xs mt-1">{errors.shipping.zipCode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <input 
                    type="text" 
                    value={shippingAddress.country} 
                    onChange={(e) => {
                      setShippingAddress({...shippingAddress, country: e.target.value});
                      validateFieldRealtime('country', e.target.value, 'shipping');
                    }}
                    onBlur={(e) => validateFieldRealtime('country', e.target.value, 'shipping')}
                    className={cn("w-full px-3 py-2 border rounded-md", errors.shipping.country && "border-red-500")}
                    placeholder="USA"
                  />
                  {errors.shipping.country && <p className="text-red-500 text-xs mt-1">{errors.shipping.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <CreditCard className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Secure Payment with Stripe</h3>
                <p className="text-sm text-blue-700">You'll be redirected to Stripe's secure checkout page to complete your payment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">${checkoutData.subtotal.toFixed(2)}</span></div>
            {checkoutData.discount > 0 && <div className="flex justify-between"><span className="text-gray-600">Discount</span><span className="font-medium text-red-600">-${checkoutData.discount.toFixed(2)}</span></div>}
            {checkoutData.pointsDiscount > 0 && <div className="flex justify-between"><span className="text-gray-600">Points Discount ({checkoutData.pointsUsed} pts)</span><span className="font-medium text-green-600">-${checkoutData.pointsDiscount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>${checkoutData.total.toFixed(2)}</span></div>
          </div>

          <Button onClick={handlePlaceOrder} disabled={loading} className="w-full mt-6 bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Redirecting to Stripe..." : "Proceed to Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
