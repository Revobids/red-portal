'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { useEffect } from 'react';
import { useAuthInit } from '@/hooks/useAuth';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}