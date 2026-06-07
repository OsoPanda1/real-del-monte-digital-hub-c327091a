import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  total_points: number;
  level: number;
}

export type AppRole = "admin" | "moderator" | "merchant" | "tourist";

interface RDMAuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpEmail: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const RDMAuthContext = createContext<RDMAuthContextValue | undefined>(undefined);

export function RDMAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileAndRoles = useCallback(async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(p ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
  }, []);

  useEffect(() => {
    // 1. Listener FIRST (synchronous setState only)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer DB calls
        setTimeout(() => loadProfileAndRoles(s.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    // 2. THEN check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfileAndRoles(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfileAndRoles]);

  const signInEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpEmail = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signInGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) return { error: res.error instanceof Error ? res.error.message : String(res.error) };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await loadProfileAndRoles(user.id);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <RDMAuthContext.Provider
      value={{ user, session, profile, roles, loading, signInEmail, signUpEmail, signInGoogle, signOut, refreshProfile, hasRole }}
    >
      {children}
    </RDMAuthContext.Provider>
  );
}

export function useRDMAuth() {
  const ctx = useContext(RDMAuthContext);
  if (!ctx) throw new Error("useRDMAuth must be used within RDMAuthProvider");
  return ctx;
}
