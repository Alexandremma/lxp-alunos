import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  buildAliceLaunchUrl,
  getAliceLaunchKeyForApp,
  isAliceConfigured,
  splitAlicePersonName,
  type AliceLaunchUser,
} from "@/services/aliceService"

const IFRAME_NAME = "aliceLessonFrame"

export type AliceLessonFrameProps = {
  contentId: string
  user: AliceLaunchUser
  className?: string
  minHeight?: number | string
  useHttp?: boolean
}

export function AliceLessonFrame({
  contentId,
  user,
  className,
  minHeight = "70vh",
  useHttp,
}: AliceLessonFrameProps) {
  const [error, setError] = React.useState<string | null>(null)
  const [launching, setLaunching] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const submitLaunch = React.useCallback(async () => {
    if (!isAliceConfigured()) {
      setError("Credenciais Alice não configuradas (VITE_ALICE_API_KEY / VITE_ALICE_API_SECRET).")
      return
    }
    if (!contentId.trim()) {
      setError("Content ID (?c=) ausente para esta aula.")
      return
    }
    if (!user.userId.trim() || !user.fullName.trim()) {
      setError("Perfil do aluno incompleto (nome ou user_id).")
      return
    }

    setError(null)
    setLaunching(true)

    try {
      const launchKey = await getAliceLaunchKeyForApp()
      if (!launchKey) {
        setError("Não foi possível gerar a chave HMAC de launch.")
        return
      }

      const { given, family } = splitAlicePersonName(user.fullName)
      const form = formRef.current
      if (!form) return

      form.action = buildAliceLaunchUrl(contentId, useHttp)
      const set = (name: string, value: string) => {
        const input = form.querySelector(`input[name="${name}"]`) as HTMLInputElement | null
        if (input) input.value = value
      }

      set("key", launchKey)
      set("lis_person_name_full", user.fullName.trim())
      set("user_id", user.userId.trim())
      set("lis_person_contact_email_primary", user.email.trim() || "aluno@lxp.local")
      set("lis_person_name_family", family)
      set("lis_person_name_given", given)

      form.submit()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao iniciar material Alice.")
    } finally {
      setLaunching(false)
    }
  }, [contentId, user, useHttp])

  React.useEffect(() => {
    void submitLaunch()
  }, [submitLaunch])

  if (!isAliceConfigured()) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Integração Alice</AlertTitle>
        <AlertDescription>
          Variáveis de ambiente Alice não configuradas neste deploy.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertTitle>Material indisponível</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {launching && (
        <p className="text-sm text-muted-foreground mb-2">Carregando material Alice…</p>
      )}
      <iframe
        name={IFRAME_NAME}
        title="Conteúdo da aula (Alice)"
        className="w-full rounded-xl border border-border bg-background"
        style={{ minHeight }}
      />
      <form
        ref={formRef}
        method="POST"
        target={IFRAME_NAME}
        className="hidden"
        aria-hidden
      >
        <input type="hidden" name="key" defaultValue="" />
        <input type="hidden" name="lis_person_name_full" defaultValue="" />
        <input type="hidden" name="user_id" defaultValue="" />
        <input type="hidden" name="roles" defaultValue="Learner" />
        <input type="hidden" name="lis_person_name_family" defaultValue="" />
        <input type="hidden" name="lis_person_name_given" defaultValue="" />
        <input type="hidden" name="lis_person_contact_email_primary" defaultValue="" />
      </form>
    </div>
  )
}
