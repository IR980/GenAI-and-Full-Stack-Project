import { useContext } from "react";
import { AuthContext } from "../auth.context";
import * as authApi from "../services/auth.api";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  const { user, setUser, loading, setLoading } = context;

  const runAuth = async (action, payload) => {
    setLoading(true);
    try {
      const data = await action(payload);
      if (data.user) setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = (payload) => runAuth(authApi.login, payload);
  const handleRegister = (payload) => runAuth(authApi.register, payload);
  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  return { user, loading, handleLogin, handleRegister, handleLogout };
}
