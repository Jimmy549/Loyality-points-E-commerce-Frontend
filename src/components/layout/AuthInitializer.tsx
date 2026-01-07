"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { initializeAuth } from '@/lib/features/auth/authSlice';
import SpinnerbLoader from '@/components/ui/SpinnerbLoader';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch();
  const { initialized, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, initialized]);

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SpinnerbLoader className="w-8 h-8 border-2 border-gray-300 border-r-black" />
      </div>
    );
  }

  return <>{children}</>;
}