import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function Protected({ children }) {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">
        Checking your session…
      </main>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
