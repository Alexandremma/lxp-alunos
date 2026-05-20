/**
 * Página interna para Teste 2 (launch Alice) no domínio deployado (ex.: lxp-alunos.vercel.app).
 * URL: /teste-alice
 * @see INTEGRACAO_ALICE_EADSTOCK.md
 */
import * as React from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AliceLessonFrame } from "@/components/learning/AliceLessonFrame"
import { useAuth } from "@/hooks/use-auth"
import { isAliceConfigured } from "@/services/aliceService"

const PRESETS = [
  {
    label: "Disc. 38 — Apresentação",
    contentId: "dd77152b-ab33-4748-b9ae-396b20de7865",
  },
  {
    label: "Disc. 38 — Por onde começar",
    contentId: "9cd1be3d-093a-4e24-8b25-c52d90a0d9b3",
  },
  {
    label: "Disc. 150 — Apresentação Antropologia",
    contentId: "a1a6b46c-de78-40ab-8e54-3db9b866a47b",
  },
] as const

const AliceLaunchTest = () => {
  const { user, profile, loading } = useAuth()
  const [contentId, setContentId] = React.useState(PRESETS[0].contentId)
  const [useHttp, setUseHttp] = React.useState(false)
  const [launchKey, setLaunchKey] = React.useState(0)
  const [manualName, setManualName] = React.useState("")
  const [manualUserId, setManualUserId] = React.useState("")
  const [manualEmail, setManualEmail] = React.useState("")

  const launchUser = React.useMemo(() => {
    const fullName =
      manualName.trim() ||
      profile?.name?.trim() ||
      (user?.email ? user.email.split("@")[0] : "") ||
      "Aluno Teste LXP"
    const userId = manualUserId.trim() || profile?.user_id || user?.id || "2"
    const email = manualEmail.trim() || profile?.email || user?.email || "aluno.teste@exemplo.com"
    return { fullName, userId, email }
  }, [manualName, manualUserId, manualEmail, profile, user])

  const host = typeof window !== "undefined" ? window.location.host : ""

  return (
    <DashboardLayout>
      <PageHeader
        title="Teste Alice (launch)"
        description="Valida POST + iframe no domínio cadastrado na B42 (whitelist)."
      />

      <div className="space-y-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status do deploy</CardTitle>
            <CardDescription>
              Abra esta página em <strong>https://lxp-alunos.vercel.app/teste-alice</strong> (ou seu
              domínio de produção). Origem atual: <code>{host || "—"}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant={isAliceConfigured() ? "default" : "destructive"}>
              Alice env: {isAliceConfigured() ? "configurado" : "ausente"}
            </Badge>
            <Badge variant={user ? "default" : "secondary"}>
              Sessão: {loading ? "…" : user ? "logado" : "visitante"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parâmetros de launch</CardTitle>
            <CardDescription>
              Credenciais vêm do Vercel (<code>VITE_ALICE_*</code>). Dados do aluno do perfil ou campos
              abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.contentId}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContentId(p.contentId)
                    setLaunchKey((k) => k + 1)
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentId">Content ID (?c=)</Label>
              <Input
                id="contentId"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome (lis_person_name_full)</Label>
                <Input
                  id="fullName"
                  placeholder={profile?.name ?? "Leandro Ray"}
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">user_id (LMS)</Label>
                <Input
                  id="userId"
                  placeholder={profile?.user_id ?? "2"}
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  placeholder={profile?.email ?? "aluno@teste.com"}
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="useHttp"
                checked={useHttp}
                onCheckedChange={(v) => setUseHttp(v === true)}
              />
              <Label htmlFor="useHttp" className="font-normal cursor-pointer">
                Usar http:// no launch (exemplo PHP B42)
              </Label>
            </div>

            <Button type="button" onClick={() => setLaunchKey((k) => k + 1)}>
              Recarregar material no iframe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>
              Se aparecer “Oops / ERROR 500” aqui também, o domínio já está na whitelist — escale à B42
              com origem <code>{host}</code> e o content ID acima.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AliceLessonFrame
              key={`${launchKey}-${contentId}-${useHttp}`}
              contentId={contentId}
              user={launchUser}
              useHttp={useHttp}
            />
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          <Link to="/cursos-livres" className="underline">
            Voltar às disciplinas
          </Link>
          {" · "}
          Doc: <code>INTEGRACAO_ALICE_EADSTOCK.md</code>
        </p>
      </div>
    </DashboardLayout>
  )
}

export default AliceLaunchTest
