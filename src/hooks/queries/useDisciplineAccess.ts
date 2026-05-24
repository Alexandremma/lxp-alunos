import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { getDisciplineAccessForStudent } from "@/services/disciplineAccessService"

export function useDisciplineAccess(disciplineId: string | undefined) {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ["lxp", "discipline-access", profile?.id, disciplineId],
    queryFn: () => getDisciplineAccessForStudent(profile!.id, disciplineId!),
    enabled: !!profile?.id && !!disciplineId,
    staleTime: 30_000,
  })
}
