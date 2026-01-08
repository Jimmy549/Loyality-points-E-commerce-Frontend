"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CartBtn = () => {
  const { cart } = useAppSelector((state: RootState) => state.carts);
  const [animate, setAnimate] = useState(false);
  const [prevQuantity, setPrevQuantity] = useState(0);

  useEffect(() => {
    if (cart && cart.totalQuantities > prevQuantity) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
    }
    if (cart) {
      setPrevQuantity(cart.totalQuantities);
    }
  }, [cart?.totalQuantities]);

  return (
    <Link href="/cart" className="relative mr-[14px] p-1">
      <div className={`transition-transform duration-300 ${
        animate ? 'scale-125 animate-bounce' : 'scale-100'
      }`}>
        <Image
          priority
          src="/icons/cart.svg"
          height={100}
          width={100}
          alt="cart"
          className="max-w-[22px] max-h-[22px]"
        />
      </div>
      {cart && cart.totalQuantities > 0 && (
        <span className={`border bg-black text-white rounded-full w-fit-h-fit px-1 text-xs absolute -top-3 left-1/2 -translate-x-1/2 transition-all duration-300 ${
          animate ? 'scale-150 bg-green-600' : 'scale-100'
        }`}>
          {cart.totalQuantities}
        </span>
      )}
    </Link>
  );
};

export default CartBtn;
