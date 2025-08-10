import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, type SupabaseUser } from '../lib/supabaseClient';

type AuthContextValue = {
  user: SupabaseUser | null;
  loading: boolean;
  signInWithOAuth: (provider: 'google' | 'github' | 'facebook') => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook') => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(() => ({ user, loading, signInWithOAuth, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


