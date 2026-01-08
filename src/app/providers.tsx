"use client";

import React, { useRef, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";
import { PersistGate } from "redux-persist/integration/react";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";
import SocketManager from "@/components/layout/SocketManager";
import AuthInitializer from "@/components/layout/AuthInitializer";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const storeRef = useRef<AppStore | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!storeRef.current) {
    const { store, persistor } = makeStore();
    storeRef.current = { store, persistor };
  }

  if (!isClient) {
    return (
      <Provider store={storeRef.current.store}>
        {children}
      </Provider>
    );
  }

  return (
    <Provider store={storeRef.current.store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <SpinnerbLoader className="w-8 h-8 border-2 border-gray-300 border-r-black" />
          </div>
        }
        persistor={storeRef.current.persistor}
      >
        <AuthInitializer>
          <SocketManager />
          {children}
        </AuthInitializer>
      </PersistGate>
    </Provider>
  );
};

export default Providers;