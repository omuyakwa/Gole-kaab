import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  requires2FA: boolean;
  role: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; requires2FA?: boolean }>;
  signInWithOtp: (email: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data, error } = await supabase.rpc('get_user_role');
        if (error) {
          console.error('Error fetching user role:', error);
        } else {
          setRole(data);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    };

    fetchSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data, error } = await supabase.rpc('get_user_role');
          if (error) {
            console.error('Error fetching user role:', error);
          } else {
            setRole(data);
          }
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || ''
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setRequires2FA(false);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if the error indicates that 2FA is required
      if (error.message.includes('second factor')) {
        setRequires2FA(true);
        return { error: null, requires2FA: true };
      }
      return { error };
    }

    // This part will be executed if the user does not have 2FA enabled
    setSession(data.session);
    setUser(data.session?.user ?? null);
    return { error: null };
  };

  const signInWithOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (!error) {
      setRequires2FA(false);
    }
    return { error };
  };

  const signOut = async () => {
    setRequires2FA(false);
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    requires2FA,
    role,
    signUp,
    signIn,
    signInWithOtp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};