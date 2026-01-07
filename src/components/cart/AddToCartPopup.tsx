"use client";

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { hideAddToCartPopup } from '@/lib/features/cart/cartSlice';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';

export default function AddToCartPopup() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { showAddToCartPopup, lastAddedItem, itemCount } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (showAddToCartPopup) {
      const timer = setTimeout(() => {
        dispatch(hideAddToCartPopup());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAddToCartPopup, dispatch]);

  const handleClose = () => {
    dispatch(hideAddToCartPopup());
  };

  const handleViewCart = () => {
    dispatch(hideAddToCartPopup());
    router.push('/cart');
  };

  // Only show popup if user is authenticated
  if (!isAuthenticated || !showAddToCartPopup || !lastAddedItem) return null;

  return (
    <Dialog open={showAddToCartPopup} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-semibold">Added to Cart!</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={lastAddedItem.srcUrl}
              alt={lastAddedItem.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{lastAddedItem.title}</h4>
            <p className="text-sm text-gray-600">
              Quantity: {lastAddedItem.quantity}
            </p>
            <p className="text-sm font-medium mt-1">
              {lastAddedItem.paymentType === 'points' 
                ? `${lastAddedItem.pointsPrice || lastAddedItem.price} points`
                : `$${lastAddedItem.price}`
              }
            </p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Cart total: {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleClose}
          >
            Continue Shopping
          </Button>
          <Button 
            className="flex-1 bg-black hover:bg-gray-800 text-white"
            onClick={handleViewCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}