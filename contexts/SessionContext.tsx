import { useContext, createContext, useState, useEffect } from "react";

import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface SessionContextInterface {
  session: Session | null;
  isAuthenticated: boolean;
  loadingSession: boolean;
  setSession: (session: Session | null) => void;
}

const SessionContext = createContext<SessionContextInterface | null>(null);

function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

function SessionProvider({ children }: { children: React.ReactNode }) {
  const [loadingSession, setLoadingSession] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const isAuthenticated = !!session;

  useEffect(() => {
    const getSession = async () => {
      const sessionData = await supabase.auth.getSession();
      setSession(sessionData.data.session);
      setLoadingSession(false);
    };

    void getSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{ session, isAuthenticated, loadingSession, setSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export { SessionContext, SessionProvider, useSession };
