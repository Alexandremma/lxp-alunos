import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  isLikelyNetworkError,
  mapResetPasswordErrorMessage,
  mapSignInErrorMessage,
  STUDENT_BLOCKED_MESSAGE,
} from "@/lib/authLoginMessages";
import { signOutIfEnrollmentBlocked } from "@/hooks/useStudentAccessGate";

const DEFAULT_LXP_ALUNOS_SET_PASSWORD_URL = "https://lxp-alunos.vercel.app/definir-senha";
const lxpAlunosSetPasswordUrl = (
  import.meta.env.VITE_LXP_ALUNOS_SET_PASSWORD_URL ?? DEFAULT_LXP_ALUNOS_SET_PASSWORD_URL
).trim();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authView, setAuthView] = useState<"login" | "forgot">("login");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { blockedMessage?: string } | null;
    if (state?.blockedMessage) {
      setError(state.blockedMessage);
      window.history.replaceState({}, document.title, location.pathname);
    }
    const params = new URLSearchParams(location.search);
    if (params.get("reason") === "blocked") {
      setError(STUDENT_BLOCKED_MESSAGE);
    }
  }, [location.state, location.search, location.pathname]);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const errorCode = params.get("error_code");
    if (!errorCode) return;

    if (errorCode === "otp_expired") {
      setError("Este link de ativação expirou ou já foi utilizado. Solicite um novo convite/redefinição de senha.");
    } else {
      const description = params.get("error_description");
      setError(
        description
          ? decodeURIComponent(description.replace(/\+/g, " "))
          : "Não foi possível concluir a ativação da conta.",
      );
    }

    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Informe seu e-mail.");
      return;
    }
    if (!password) {
      setError("Informe sua senha.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError || !session) {
        setError(mapSignInErrorMessage(signInError));
        return;
      }

      const currentUser = session.user;

      let profileId: string | null = null;

      const { data: existingProfile, error: profileError } = await supabase
        .from("lxp_profiles")
        .select("id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.warn("[Login] Erro ao carregar perfil:", profileError.message);
      } else if (!existingProfile) {
        const { data: inserted, error: insertError } = await supabase
          .from("lxp_profiles")
          .insert({
            user_id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.full_name ?? currentUser.email,
            role: "student",
          })
          .select("id")
          .maybeSingle();

        if (insertError) {
          console.warn("[Login] Erro ao criar perfil:", insertError.message);
        } else {
          profileId = inserted?.id ?? null;
        }
      } else {
        profileId = existingProfile.id as string;
      }

      const blockedMessage = await signOutIfEnrollmentBlocked(currentUser.id);
      if (blockedMessage) {
        setError(blockedMessage);
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        isLikelyNetworkError(err)
          ? "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
          : "Não foi possível entrar. Tente novamente em instantes.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Informe o e-mail cadastrado.");
      return;
    }

    setForgotLoading(true);
    setError(null);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: lxpAlunosSetPasswordUrl,
      });
      if (resetErr) {
        setError(mapResetPasswordErrorMessage(resetErr));
        return;
      }
      setForgotMessage(
        "Se existir uma conta com este e-mail, você receberá um link para redefinir a senha em instantes.",
      );
    } catch (err) {
      setError(
        isLikelyNetworkError(err)
          ? "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
          : "Não foi possível enviar o e-mail. Tente novamente ou fale com o suporte.",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const formBusy = loading || forgotLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div aria-live="assertive" className="space-y-4">
            {authView === "login" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={formBusy}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline disabled:opacity-50"
                      disabled={formBusy}
                      onClick={() => {
                        setForgotMessage(null);
                        setAuthView("forgot");
                      }}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={formBusy}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Sua conta é criada pela instituição. Em caso de dúvidas, entre em contato
                  com o suporte.
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={formBusy}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {forgotMessage && (
                  <Alert variant="success">
                    <AlertDescription>{forgotMessage}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={forgotLoading}>
                  {forgotLoading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={formBusy}
                  onClick={() => {
                    setError(null);
                    setForgotMessage(null);
                    setAuthView("login");
                  }}
                >
                  Voltar ao login
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
