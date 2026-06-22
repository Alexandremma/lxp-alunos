import { supabase } from "@/lib/supabaseClient";

export async function writeAuditLog(input: {
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const { data, error } = await supabase.rpc("lxp_write_audit_log", {
    p_action: input.action,
    p_entity_type: input.entityType ?? null,
    p_entity_id: input.entityId ?? null,
    p_metadata: input.metadata ?? {},
  });
  if (error) throw error;
  return data as string;
}
