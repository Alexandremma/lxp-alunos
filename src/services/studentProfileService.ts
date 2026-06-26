import { supabase } from "@/lib/supabaseClient";

export type UpdateOwnStudentProfileInput = {
  name: string;
  phone?: string;
  birthDate?: string;
};

export async function updateOwnStudentProfile(
  userId: string,
  input: UpdateOwnStudentProfileInput,
): Promise<void> {
  const phone = input.phone?.trim();
  const birthDate = input.birthDate?.trim();

  const { error } = await supabase
    .from("lxp_profiles")
    .update({
      name: input.name.trim(),
      phone: phone ? phone : null,
      birth_date: birthDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}
