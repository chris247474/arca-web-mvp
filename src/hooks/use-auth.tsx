"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { getUserProfile, syncUser, UserProfile, UserRole } from "@/lib/actions/auth";

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;

  // User data
  user: UserProfile | null; // Supabase profile
  privyUser: PrivyUser | null; // Raw Privy user

  // Actions
  login: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;

  // Role helpers
  hasRole: boolean;
  isCurator: boolean;
  isInvestor: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, login, logout: privyLogout } = usePrivy();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!privyUser?.id) {
      setUserProfile(null);
      return null;
    }

    setIsLoadingProfile(true);
    try {
      const profile = await getUserProfile(privyUser.id);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setUserProfile(null);
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [privyUser?.id]);

  // Sync user on authentication
  useEffect(() => {
    if (authenticated && privyUser?.id) {
      // Sync user data to Supabase then fetch profile
      syncUser({
        id: privyUser.id,
        email: privyUser.email?.address,
        google: privyUser.google ? {
          email: privyUser.google.email,
          name: privyUser.google.name ?? undefined,
        } : null,
      }).then((profile) => {
        if (profile) {
          setUserProfile(profile);
        } else {
          // If sync failed, try to fetch existing profile
          fetchProfile();
        }
      }).catch((error) => {
        console.error("Failed to sync user:", error);
        fetchProfile();
      });
    } else if (!authenticated) {
      setUserProfile(null);
    }
  }, [authenticated, privyUser?.id, fetchProfile]);

  // Refresh profile (can be called manually, returns the profile)
  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    return await fetchProfile();
  }, [fetchProfile]);

  // Custom logout that clears profile
  const handleLogout = useCallback(async () => {
    setUserProfile(null);
    await privyLogout();
  }, [privyLogout]);

  // Compute role helpers
  const hasRole = userProfile?.role != null;
  const isCurator = userProfile?.role === "curator";
  const isInvestor = userProfile?.role === "investor";

  // Combined loading state
  const isLoading = !ready || (authenticated && isLoadingProfile && !userProfile);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        isLoading,
        user: userProfile,
        privyUser: privyUser ?? null,
        login,
        logout: handleLogout,
        refreshProfile,
        hasRole,
        isCurator,
        isInvestor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe defaults when used outside provider
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      privyUser: null,
      login: () => {},
      logout: async () => {},
      refreshProfile: async () => null,
      hasRole: false,
      isCurator: false,
      isInvestor: false,
    };
  }
  return context;
}

// Export types for use in other files
export type { UserProfile, UserRole };
