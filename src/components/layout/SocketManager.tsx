"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/hooks/redux";

export default function SocketManager() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Disable socket connection to prevent websocket errors
    // if (isAuthenticated && user?._id) {
    //   socketService.connect(user._id);
    // } else {
    //   socketService.disconnect();
    // }

    // return () => {
    //   socketService.disconnect();
    // };
  }, [isAuthenticated, user]);

  return null;
}
