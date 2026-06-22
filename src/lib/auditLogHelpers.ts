import { writeAuditLog } from "@/services/auditLogService";

export type AuditLogInput = Parameters<typeof writeAuditLog>[0];

export function fireAuditLog(input: AuditLogInput): void {
  void writeAuditLog(input).catch((err) => {
    console.warn(`[audit] ${input.action}`, err);
  });
}
