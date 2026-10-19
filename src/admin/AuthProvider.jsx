import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext({ session: null, loading: true });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // auth-js re-announces the session on every tab focus and token refresh.
    // Keep the same object unless the user or token actually changed, so
    // consumers (and half-filled admin forms) don't re-render or remount.
    const update = (next) =>
      setSession((prev) =>
        prev?.user?.id === next?.user?.id &&
        prev?.access_token === next?.access_token
          ? prev
          : next
      );
    supabase.auth.getSession().then(({ data }) => {
      update(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      update(newSession);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ session, loading }), [session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
