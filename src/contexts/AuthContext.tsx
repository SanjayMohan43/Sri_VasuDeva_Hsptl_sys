import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "doctor" | "patient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  register: (name: string, email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session on initial load
    const saved = localStorage.getItem("srivasudeva_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Admin bypass for requested credentials
      if (email === "vasupagadala999@gmail.com" && password === "vasu1234") {
        const adminData: User = {
          id: "admin-system",
          name: "Vasu Dev",
          email: email,
          role: "admin"
        };
        setUser(adminData);
        localStorage.setItem("srivasudeva_user", JSON.stringify(adminData));
        return { success: true };
      }

      // For this app, we're using the custom 'app_users' table created in our SQL schema,
      // not the built-in Supabase Auth (which requires email confirmation by default).
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        console.error("Login failed:", error);
        return { success: false, error: "Invalid email or password" };
      }

      const userData: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole
      };

      setUser(userData);
      localStorage.setItem("srivasudeva_user", JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('email')
        .eq('email', email)
        .single();
        
      if (existingUser) {
        return { success: false, error: "User with this email already exists" };
      }

      const newUser = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        role: "patient"
      };

      const { error } = await supabase.from('app_users').insert(newUser);

      if (error) {
        console.error("Registration failed:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || "An unexpected error occurred during registration" };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("srivasudeva_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
