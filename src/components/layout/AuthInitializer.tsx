"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { initializeAuth, refreshUserData } from '@/lib/features/auth/authSlice';
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

  // Sync profile data once authenticated to ensure points are fresh
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  useEffect(() => {
    if (initialized && isAuthenticated && user) {
       // Optional: only refresh if we want real-time sync on load
       dispatch(refreshUserData());
    }
  }, [initialized, isAuthenticated]); // Run once when initialization completes and user is authenticated

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SpinnerbLoader className="w-8 h-8 border-2 border-gray-300 border-r-black" />
      </div>
    );
  }

  return <>{children}</>;
}