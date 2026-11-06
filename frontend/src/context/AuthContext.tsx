import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { db } from '../services/db';
import { StudentProfile } from '../types';
import { INITIAL_STUDENT_PROFILE } from '../constants';

const CACHED_PROFILE_KEY = 'anshul_erp_cached_profile';
const LOCAL_SESSION_KEY = 'anshul_erp_local_session';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  isSupabase: boolean;
  keepSignedIn: boolean;
  setKeepSignedIn: (val: boolean) => void;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, profileData?: Partial<StudentProfile>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  updateAvatar: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    try {
      const cached = localStorage.getItem(CACHED_PROFILE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  // Sync profile to localStorage cache
  const updateCachedProfile = (p: StudentProfile | null) => {
    setProfile(p);
    if (p) {
      localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(p));
    } else {
      localStorage.removeItem(CACHED_PROFILE_KEY);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session retrieval error', error);
          }

          if (session?.user && mounted) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            db.setUserId(session.user.id);
            // Fetch fresh profile in background
            const freshProfile = await db.getProfile();
            if (mounted) {
              updateCachedProfile(freshProfile);
            }
          } else if (mounted) {
            // Check if user was logged in previously or fallback mode
            const localSaved = localStorage.getItem(LOCAL_SESSION_KEY);
            if (localSaved) {
              const parsed = JSON.parse(localSaved);
              setUser(parsed);
              db.setUserId(parsed.id);
              const localProfile = await db.getProfile();
              if (mounted) updateCachedProfile(localProfile);
            }
          }
        } catch (err) {
          console.error('Failed to init auth session:', err);
        }
      } else {
        // Fallback Local Storage Mode
        const localSaved = localStorage.getItem(LOCAL_SESSION_KEY);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          setUser(parsed);
          db.setUserId(parsed.id);
          const localProfile = await db.getProfile();
          if (mounted) updateCachedProfile(localProfile);
        } else {
          // By default, student is signed in locally as Anshul Shrivastava for immediate testing & command center usage
          const defaultUser = { id: 'anshul-local-id', email: INITIAL_STUDENT_PROFILE.email };
          setUser(defaultUser);
          db.setUserId(defaultUser.id);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(defaultUser));
          const initialProfile = await db.getProfile();
          if (mounted) updateCachedProfile(initialProfile);
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initSession();

    // Supabase auth state change subscription
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          db.setUserId(session.user.id);
          const fresh = await db.getProfile();
          updateCachedProfile(fresh);
        } else {
          setUser(null);
          updateCachedProfile(null);
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
        setIsLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        if (!password) {
          setIsLoading(false);
          return { error: 'Password is required' };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          db.setUserId(data.user.id);
          const fresh = await db.getProfile();
          updateCachedProfile(fresh);
        }
      } else {
        // Offline / Fallback mode
        const localUser = { id: 'anshul-local-id', email };
        setUser(localUser);
        db.setUserId(localUser.id);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
        const localProfile = await db.getProfile();
        updateCachedProfile(localProfile);
      }
      setIsLoading(false);
      return {};
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || 'An unexpected error occurred during sign in.' };
    }
  };

  const signUp = async (
    email: string,
    password?: string,
    profileData?: Partial<StudentProfile>
  ): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        if (!password) {
          setIsLoading(false);
          return { error: 'Password is required' };
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: profileData?.full_name || 'Anshul Shrivastava',
              branch: profileData?.branch || 'B.Tech (IT)',
              semester: profileData?.semester || 3,
              section: profileData?.section || 'A',
              selected_group: profileData?.selected_group || 1,
              student_id: profileData?.student_id || 'ASET-IT-2026-031',
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }

        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          db.setUserId(data.user.id);
          const fresh = await db.getProfile();
          updateCachedProfile(fresh);
        }
      } else {
        const localUser = { id: `local-${Date.now()}`, email };
        setUser(localUser);
        db.setUserId(localUser.id);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
        const newProfile = await db.updateProfile({
          ...profileData,
          email,
          full_name: profileData?.full_name || 'Anshul Shrivastava',
        });
        updateCachedProfile(newProfile);
      }
      setIsLoading(false);
      return {};
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || 'Signup failed' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(CACHED_PROFILE_KEY);
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    const updated = await db.updateProfile(updates);
    updateCachedProfile(updated);
  };

  const updateAvatar = async (url: string) => {
    await updateProfile({ avatar_url: url });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isSupabase: isSupabaseConfigured,
        keepSignedIn,
        setKeepSignedIn,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
