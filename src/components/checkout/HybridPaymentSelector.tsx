"use client";

import { useState } from "react";
import { DollarSign, Award } from "lucide-react";

interface HybridPaymentSelectorProps {
  price: number;
  pointsCost: number;
  userPoints: number;
  onSelect: (method: 'money' | 'points') => void;
  selected?: 'money' | 'points';
}

export default function HybridPaymentSelector({
  price,
  pointsCost,
  userPoints,
  onSelect,
  selected = 'money'
}: HybridPaymentSelectorProps) {
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'points'>(selected);
  
  const handleSelect = (method: 'money' | 'points') => {
    setPaymentMethod(method);
    onSelect(method);
  };

  const hasEnoughPoints = userPoints >= pointsCost;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Choose Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect('money')}
          className={`p-4 border-2 rounded-lg transition-all ${
            paymentMethod === 'money'
              ? 'border-black bg-black text-white'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6" />
            <span className="text-sm font-medium">Pay with Money</span>
          </div>
          <div className="text-2xl font-bold">${price}</div>
          <p className="text-sm mt-2 opacity-80">Standard payment</p>
        </button>

        <button
          onClick={() => handleSelect('points')}
          disabled={!hasEnoughPoints}
          className={`p-4 border-2 rounded-lg transition-all ${
            paymentMethod === 'points'
              ? 'border-yellow-500 bg-yellow-500 text-white'
              : hasEnoughPoints
              ? 'border-gray-200 hover:border-yellow-300'
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6" />
            <span className="text-sm font-medium">Pay with Points</span>
          </div>
          <div className="text-2xl font-bold">{pointsCost} pts</div>
          <p className="text-sm mt-2 opacity-80">
            {hasEnoughPoints 
              ? `You have ${userPoints} points` 
              : `Need ${pointsCost - userPoints} more points`
            }
          </p>
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Hybrid Product:</strong> This product can be purchased with either money or loyalty points.
          {!hasEnoughPoints && (
            <span className="block mt-1">
              💡 Earn more points by making purchases to unlock points payment!
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
