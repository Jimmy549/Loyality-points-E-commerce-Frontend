"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks/redux";
import { setCredentials } from "@/lib/features/auth/authSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import axios from "axios";

export default function SocialCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token
      localStorage.setItem("token", token);

      // Fetch user data
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(
            setCredentials({
              user: response.data,
              token: token,
            })
          );

          // Redirect based on role
          const userRole = response.data.role;
          if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
            router.replace("/admin");
          } else {
            router.replace("/");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          router.replace("/auth/login");
        });
    } else {
      router.replace("/auth/login");
    }
  }, [searchParams, dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
