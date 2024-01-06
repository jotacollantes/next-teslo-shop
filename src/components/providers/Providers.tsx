"use client";

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { SessionProvider } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

export const Providers = ({ children }: Props) => {
   //console.log('paypal', JSON.stringify(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, null, 2))

  return (
    <PayPalScriptProvider options={{ 
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
      intent: 'capture',
      currency: 'USD',
    }}>
      <SessionProvider>{children}</SessionProvider>
    </PayPalScriptProvider>
  );
};
