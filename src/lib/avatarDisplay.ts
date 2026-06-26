/** Iniciais para avatar: e-mail → parte local; 2+ palavras → 1ª + última; senão → 2 primeiros chars. */
export function initialsFromDisplay(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "?";

  if (trimmed.includes("@") && !trimmed.includes(" ")) {
    const localPart = trimmed.split("@")[0] ?? trimmed;
    return localPart.slice(0, 2).toUpperCase() || "?";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export function initialsForUserAvatar(options: {
  name?: string | null;
  email?: string | null;
  genericLabel?: string;
}): string {
  const name = options.name?.trim() ?? "";
  const email = options.email?.trim() ?? "";
  const genericLabel = options.genericLabel?.trim();

  if (genericLabel && name === genericLabel && email) {
    return initialsFromDisplay(email);
  }

  if (name) return initialsFromDisplay(name);
  if (email) return initialsFromDisplay(email);
  return "?";
}

export const USER_AVATAR_FALLBACK_CLASS =
  "flex items-center justify-center bg-primary text-primary-foreground font-semibold";
