import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export function useLogout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return { logout, loading };
}

