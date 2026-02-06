"use client";

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";

interface PrivyClientProviderProps {
  children: React.ReactNode;
}

export function PrivyClientProvider({ children }: PrivyClientProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID not set, Privy auth will not work");
    return <>{children}</>;
  }

  return (
    <PrivyProviderBase
      appId={appId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#0f172a",
        },
        loginMethods: ["email", "google", "wallet", "passkey"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off",
          },
          solana: {
            createOnLogin: "off",
          },
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
