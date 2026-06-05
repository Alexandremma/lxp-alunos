import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      queryClient.clear();
    } finally {
      setLoading(false);
      navigate("/login", { replace: true });
    }
  }, [navigate, queryClient]);

  return { logout, loading };
}

