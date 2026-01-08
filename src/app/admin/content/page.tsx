"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";

export default function AdminContentPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-2">Coming soon...</p>
      </div>
    </div>
  );
}
