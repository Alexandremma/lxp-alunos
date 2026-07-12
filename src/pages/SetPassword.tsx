import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePasswordRecoverySession } from "@/lib/authRecovery";
import { useSetPassword } from "@/hooks/mutations/useSetPassword";

export default function SetPassword() {
  const navigate = useNavigate();
  const recovery = usePasswordRecoverySession();
  const setPasswordMutation = useSetPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recovery.status !== "ready") return;

    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("A senha precisa ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    const result = await setPasswordMutation.mutateAsync(password);
    if (result.status === "error") {
      setError(result.message);
      return;
    }

    setMessage("Senha definida com sucesso. Você já pode entrar no LXP Alunos.");
    window.history.replaceState({}, document.title, window.location.pathname);
    navigate("/login", { replace: true });
  };

  const loading = setPasswordMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Definir senha</CardTitle>
          <CardDescription>Primeiro acesso ou redefinição de senha</CardDescription>
        </CardHeader>
        <CardContent>
          {recovery.status === "loading" && (
            <p className="mb-4 text-sm text-muted-foreground" role="status">
              Validando link de acesso…
            </p>
          )}

          {(recovery.status === "hash_error" || recovery.status === "invalid_link") && (
            <div className="mb-4 space-y-3">
              <p className="text-sm text-destructive" role="alert">
                {recovery.message}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Voltar ao login</Link>
              </Button>
            </div>
          )}

          {recovery.status === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua nova senha"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-sm text-success" role="status">
                  {message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
