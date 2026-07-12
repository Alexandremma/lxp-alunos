import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Mail, Pencil, Phone, Save, User, X } from "lucide-react";
import { toast } from "sonner";
import { LoadingLearning } from "@/components/states/LoadingLearning";
import { LoadingSpinner } from "@/components/states/LoadingSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AvatarUploadField } from "@/components/profile/AvatarUploadField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { LxpProfile } from "@/types/auth";
import { useTeamModeration } from "@/hooks/useTeamModeration";
import { useUpdateOwnStudentProfile } from "@/hooks/mutations/useUpdateOwnStudentProfile";
import { formatPhoneBr } from "@/lib/inputMasks";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email(),
  phone: z
    .string()
    .max(30, "Telefone muito longo")
    .refine((v) => !v || v.replace(/\D/g, "").length >= 10, "Telefone inválido")
    .optional(),
  birthDate: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function formatDateBr(value: string | null | undefined): string {
  if (!value) return "—";
  const iso = value.slice(0, 10);
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function profileFormValues(profile: LxpProfile | null, displayEmail: string): ProfileFormValues {
  return {
    name: profile?.name?.trim() || "",
    email: displayEmail,
    phone: profile?.phone ? formatPhoneBr(profile.phone) : "",
    birthDate: profile?.birth_date ? String(profile.birth_date).slice(0, 10) : "",
  };
}

const Profile = () => {
  const { profile, user, loading } = useAuth();
  const { isModerator, teamRoleLabel } = useTeamModeration();
  const updateProfile = useUpdateOwnStudentProfile();
  const [isEditing, setIsEditing] = useState(false);

  const displayEmail = useMemo(
    () => profile?.email?.trim() || user?.email?.trim() || "",
    [profile?.email, user?.email],
  );

  const displayName = useMemo(() => {
    const fromProfile = profile?.name?.trim();
    if (fromProfile) return fromProfile;
    const meta = user?.user_metadata?.full_name;
    if (typeof meta === "string" && meta.trim()) return meta.trim();
    if (displayEmail) return displayEmail.split("@")[0] ?? displayEmail;
    return "Aluno";
  }, [profile?.name, user, displayEmail]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", phone: "", birthDate: "" },
  });

  const fieldsDisabled = !isEditing || updateProfile.isPending;

  useEffect(() => {
    if (profile) {
      form.reset(profileFormValues(profile, displayEmail));
    }
  }, [profile, displayEmail, form]);

  const handleStartEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    if (profile) {
      form.reset(profileFormValues(profile, displayEmail));
    }
    setIsEditing(false);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        phone: values.phone,
        birthDate: values.birthDate,
      });
      toast.success("Perfil atualizado.");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar seu perfil.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingLearning type="card" className="max-w-2xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Meu perfil"
        description="Visualize e edite suas informações de cadastro."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <AvatarUploadField
                name={displayName}
                email={displayEmail}
                genericLabel="Aluno"
                avatarPath={profile?.avatar_path}
                updatedAt={profile?.updated_at}
                disabled={!isEditing}
              />
              <div className="min-w-0">
                <CardTitle>{displayName}</CardTitle>
                <CardDescription>{displayEmail || "—"}</CardDescription>
                {isModerator && teamRoleLabel ? (
                  <Badge variant="outline" className="mt-2">
                    Moderação · {teamRoleLabel}
                  </Badge>
                ) : null}
              </div>
            </div>
            {profile?.created_at ? (
              <p className="text-sm text-muted-foreground text-right shrink-0">
                Membro desde {formatDateBr(profile.created_at)}
              </p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nome completo
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" disabled={fieldsDisabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input type="email" disabled {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Campo somente leitura.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telefone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(99) 99999-9999"
                          disabled={fieldsDisabled}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(formatPhoneBr(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Data de nascimento
                      </FormLabel>
                      <FormControl>
                        <Input type="date" disabled={fieldsDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          <div className="flex justify-end gap-2 border-t border-border pt-6 mt-6">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateProfile.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Profile;
