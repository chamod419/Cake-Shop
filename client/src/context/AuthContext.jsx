import { createContext, useContext, useEffect, useState } from "react";
import { authLogin, authLogout, authMe, authRegister } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  async function refresh() {
    const { user } = await authMe();
    setUser(user);
  }

  async function signIn(username, password) {
    const { user } = await authLogin(username, password);
    setUser(user);
    return user;
  }

  async function signUp(username, password) {
    const { user } = await authRegister(username, password);
    setUser(user);
    return user;
  }

  async function signOut() {
    await authLogout();
    setUser(null);
  }

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, booting, refresh, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
