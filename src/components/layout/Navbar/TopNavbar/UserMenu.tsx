"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { logoutUser } from "@/lib/features/auth/authSlice";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { User, Award, Package, LogOut, ChevronDown, Settings } from "lucide-react";

export default function UserMenu() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      // Even if API fails, clear local state
      dispatch({ type: 'auth/clearCredentials' });
    }
    setIsOpen(false);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="p-1">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth/login" className="p-1">
        <Image
          priority
          src="/icons/user.svg"
          height={100}
          width={100}
          alt="user"
          className="max-w-[22px] max-h-[22px]"
        />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 flex items-center space-x-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        {user && (
          <div className="hidden md:flex items-center space-x-1">
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {user.name.split(' ')[0]}
              </div>
              {user.role === 'USER' && (
                <div className="text-xs text-gray-500">
                  {user.loyaltyPoints} pts
                </div>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  {user?.loyaltyPoints !== undefined && user?.role === 'USER' && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Award className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600 font-medium">
                        {user.loyaltyPoints} loyalty points
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 text-gray-400" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/orders"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Package className="w-4 h-4 text-gray-400" />
                <span>My Orders</span>
              </Link>
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 text-purple-500" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}