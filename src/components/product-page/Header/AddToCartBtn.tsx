"use client";

import { addToCart as addToCartLocal, addToCartAsync } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Product } from "@/types/product.types";
import { getBackendProductId } from "@/lib/utils/productIdMapping";
import React from "react";

const AddToCartBtn = ({ data }: { data: Product & { quantity: number } }) => {
  const dispatch = useAppDispatch();
  const { sizeSelection, colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );

  const handleAddToCart = async () => {
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
      
      console.log('✅ Product added to cart successfully');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      alert(error.message || 'Failed to add product to cart. Please try again.');
    }
  };

  return (
    <button
      type="button"
      className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all"
      onClick={handleAddToCart}
    >
      Add to Cart
    </button>
  );
};

export default AddToCartBtn;
