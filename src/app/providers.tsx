"use client";

import React, { useRef, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { AppStoreWithPersistor } from "../lib/store";
import { PersistGate } from "redux-persist/integration/react";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";
import SocketManager from "@/components/layout/SocketManager";
import AuthInitializer from "@/components/layout/AuthInitializer";
import { makeStore } from "../lib/store";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const storeRef = useRef<AppStoreWithPersistor | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!storeRef.current) {
    const { store, persistor } = makeStore();
    storeRef.current = { store, persistor };
  }

  return (
    <Provider store={storeRef.current.store}>
      {mounted ? (
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
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <SpinnerbLoader className="w-8 h-8 border-2 border-gray-300 border-r-black" />
        </div>
      )}
    </Provider>
  );
};

export default Providers;