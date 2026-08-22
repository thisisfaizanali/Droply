'use client';

import { ImageKitProvider } from 'imagekitio-next';
import { Toaster } from 'sonner';
import * as React from 'react';
import { createContext, useContext } from 'react';

export interface ProvidersProps {
  children: React.ReactNode;
}

export const ImageKitAuthContext = createContext<{
  authenticate: () => Promise<{
    signature: string;
    token: string;
    expire: number;
  }>;
}>({
  authenticate: async () => ({ signature: '', token: '', expire: 0 }),
});

export const useImageKitAuth = () => useContext(ImageKitAuthContext);

const authenticator = async () => {
  try {
    const response = await fetch('/api/imagekit-auth');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ImageKitProvider
      authenticator={authenticator}
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ''}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}
    >
      <ImageKitAuthContext.Provider value={{ authenticate: authenticator }}>
        <Toaster position="top-right" richColors />
        {children}
      </ImageKitAuthContext.Provider>
    </ImageKitProvider>
  );
}
