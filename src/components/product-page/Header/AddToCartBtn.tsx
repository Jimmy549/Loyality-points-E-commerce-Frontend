"use client";

import { addToCart as addToCartLocal, addToCartAsync } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Product } from "@/types/product.types";
import { getBackendProductId } from "@/lib/utils/productIdMapping";
import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";

const AddToCartBtn = ({ data }: { data: Product & { quantity: number } }) => {
  const dispatch = useAppDispatch();
  const { sizeSelection, colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const productId = getBackendProductId(data.id || 0);
      
      await dispatch(addToCartAsync({
        productId,
        quantity: data.quantity
      })).unwrap();
       
      dispatch(addToCartLocal({
        id: data.id || 0,
        name: data.title,
        srcUrl: data.srcUrl,
        price: data.price,
        attributes: [sizeSelection, colorSelection.name],
        discount: data.discount,
        quantity: data.quantity,
      }));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      console.log('✅ Product added to cart successfully');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      alert(error.message || 'Failed to add product to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading || success}
      className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all disabled:opacity-70 flex items-center justify-center space-x-2"
      onClick={handleAddToCart}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Adding...</span>
        </>
      ) : success ? (
        <>
          <Check className="w-5 h-5" />
          <span>Added!</span>
        </>
      ) : (
        <span>Add to Cart</span>
      )}
    </button>
  );
};

export default AddToCartBtn;
