import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      setError(description ? decodeURIComponent(description.replace(/\+/g, " ")) : "Não foi possível concluir a ativação da conta.");
    }

    // Limpa o hash de erro da URL para evitar reprocessamento ao atualizar.
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { session },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !session) {
      setError("Credenciais inválidas. Verifique seu email e senha.");
      setLoading(false);
      return;
    }

    const currentUser = session.user;

    // Tenta buscar / criar perfil, mas não bloqueia o login se der erro.
    const { data: existingProfile, error: profileError } = await supabase
      .from("lxp_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      console.warn("[Login] Erro ao carregar perfil:", profileError.message);
    } else if (!existingProfile) {
      const { error: insertError } = await supabase.from("lxp_profiles").insert({
        user_id: currentUser.id,
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name ?? currentUser.email,
        role: "student",
      });

      if (insertError) {
        console.warn("[Login] Erro ao criar perfil:", insertError.message);
      }
    }

    setLoading(false);
    navigate("/", { replace: true });
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Sua conta é criada pela instituição. Em caso de dúvidas, entre em contato
              com o suporte.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
