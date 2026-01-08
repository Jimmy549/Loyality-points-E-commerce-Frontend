"use client";

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import ProductCard from "@/components/cart-page/ProductCard";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { FaArrowRight } from "react-icons/fa6";
import { MdOutlineLocalOffer } from "react-icons/md";
import { TbBasketExclamation } from "react-icons/tb";
import { Award } from "lucide-react";
import React, { useState } from "react";
import { RootState } from "@/lib/store";
import { useAppSelector } from "@/lib/hooks/redux";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, totalPrice, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [pointsToUse, setPointsToUse] = useState(0);
  const [promoCode, setPromoCode] = useState("");

  // Show cart only if user is authenticated and has items
  const showCart = isAuthenticated && cart && cart.items.length > 0;
  
  // Calculate points discount (100 points = $5)
  const pointsDiscount = Math.floor(pointsToUse / 100) * 5;
  const finalTotal = Math.max(0, adjustedTotalPrice - pointsDiscount);
  const maxPointsUsable = Math.min(user?.loyaltyPoints || 0, Math.floor(adjustedTotalPrice / 5) * 100);

  const handleCheckout = () => {
    // Store checkout data in localStorage for checkout page
    const checkoutData = {
      subtotal: totalPrice,
      discount: totalPrice - adjustedTotalPrice,
      pointsUsed: pointsToUse,
      pointsDiscount,
      total: finalTotal,
      promoCode
    };
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    router.push('/checkout');
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        {showCart ? (
          <>
            <BreadcrumbCart />
            <h2
              className={cn([
                integralCF.className,
                "font-bold text-[32px] md:text-[40px] text-black uppercase mb-5 md:mb-6",
              ])}
            >
              your cart
            </h2>
            <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-5 items-start">
              <div className="w-full p-3.5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                {cart?.items.map((product, idx, arr) => (
                  <React.Fragment key={idx}>
                    <ProductCard data={product} />
                    {arr.length - 1 !== idx && (
                      <hr className="border-t-black/10" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="w-full lg:max-w-[505px] p-5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                <h6 className="text-xl md:text-2xl font-bold text-black">
                  Order Summary
                </h6>
                <div className="flex flex-col space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">Subtotal</span>
                    <span className="md:text-xl font-bold">${(totalPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">
                      Discount (-
                      {Math.round(
                        ((totalPrice - adjustedTotalPrice) / totalPrice) * 100
                      )}
                      %)
                    </span>
                    <span className="md:text-xl font-bold text-red-600">
                      -${(totalPrice - adjustedTotalPrice).toFixed(2)}
                    </span>
                  </div>
                  {pointsDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="md:text-xl text-black/60">
                        Points Discount ({pointsToUse} pts)
                      </span>
                      <span className="md:text-xl font-bold text-green-600">
                        -${pointsDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">
                      Delivery Fee
                    </span>
                    <span className="md:text-xl font-bold">Free</span>
                  </div>
                  <hr className="border-t-black/10" />
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black">Total</span>
                    <span className="text-xl md:text-2xl font-bold">
                      ${(finalTotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* Loyalty Points Section - Show even if user has 0 points */}
                {user && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-3">
                      <Award className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">
                        Loyalty Points
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      You have {user.loyaltyPoints || 0} points available (100 points = $5)
                    </p>
                    {user.loyaltyPoints > 0 ? (
                      <div className="space-y-2">
                        <div className="flex space-x-3">
                          <input
                            type="number"
                            min="0"
                            max={maxPointsUsable}
                            value={pointsToUse}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setPointsToUse(Math.min(maxPointsUsable, Math.max(0, value)));
                            }}
                            className="flex-1 px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Enter points to use"
                          />
                          <Button
                            type="button"
                            onClick={() => setPointsToUse(maxPointsUsable)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md whitespace-nowrap"
                          >
                            Use Max
                          </Button>
                        </div>
                        <p className="text-xs text-yellow-600">
                          Max usable: {maxPointsUsable} points (${Math.floor(maxPointsUsable / 100) * 5} discount)
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-600 italic">
                        Complete purchases to earn loyalty points!
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Text>
                      <MdOutlineLocalOffer className="text-black/40 text-2xl" />
                    </InputGroup.Text>
                    <InputGroup.Input
                      type="text"
                      name="code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Add promo code"
                      className="bg-transparent placeholder:text-black/40"
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    className="bg-black rounded-full w-full max-w-[119px] h-[48px]"
                  >
                    Apply
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handleCheckout}
                  className="text-sm md:text-base font-medium bg-black rounded-full w-full py-4 h-[54px] md:h-[60px] group"
                >
                  Go to Checkout{" "}
                  <FaArrowRight className="text-xl ml-2 group-hover:translate-x-1 transition-all" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center flex-col text-gray-300 mt-32">
            <TbBasketExclamation strokeWidth={1} className="text-6xl" />
            <span className="block mb-4">
              {!isAuthenticated 
                ? "Please login to view your cart." 
                : "Your shopping cart is empty."
              }
            </span>
            <Button className="rounded-full w-24" asChild>
              <Link href={!isAuthenticated ? "/auth/login" : "/shop"}>
                {!isAuthenticated ? "Login" : "Shop"}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}