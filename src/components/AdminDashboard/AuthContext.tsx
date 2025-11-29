// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

export type LocalRole = "teacher" | "student";

export type LocalProfile = {
  id: string;
  email: string;
  fullName: string;
  role: LocalRole;
  createdAt: string;
};

type AuthContextType = {
  user: string | null;
  profile: LocalProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, fullName: string, role: LocalRole) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "local_users";
const SESSION_KEY = "local_session";

function readUsers(): LocalProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeUsers(users: LocalProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const p: LocalProfile = JSON.parse(session);
      setUser(p.email);
      setProfile(p);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string) => {
    const users = readUsers();
    const p = users.find((u) => u.email === email);
    if (!p) throw new Error("User not found. Please sign up first.");
    localStorage.setItem(SESSION_KEY, JSON.stringify(p));
    setUser(p.email);
    setProfile(p);
  };

  const signUp = async (email: string, fullName: string, role: LocalRole) => {
    const users = readUsers();
    let p = users.find((u) => u.email === email);
    if (!p) {
      p = { id: `local-${Date.now()}`, email, fullName, role, createdAt: new Date().toISOString() };
      users.push(p);
      writeUsers(users);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(p));
    setUser(p.email);
    setProfile(p);
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
