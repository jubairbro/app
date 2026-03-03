import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface User {
  id: number;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  role: "admin" | "user" | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true, setUser: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    setRole(newUser?.role || null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchApi('/api/auth/me');
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
