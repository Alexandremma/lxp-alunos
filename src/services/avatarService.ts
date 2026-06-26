import { supabase } from "@/lib/supabaseClient";

export const USER_AVATARS_BUCKET = "user-avatars";

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 512;

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao processar a imagem."));
          return;
        }
        resolve(blob);
      },
      mime,
      quality,
    );
  });
}

async function resizeImageToBlob(image: HTMLImageElement, mime: string, quality: number): Promise<Blob> {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas não disponível.");
  context.drawImage(image, 0, 0, width, height);

  return canvasToBlob(canvas, mime, quality);
}

export async function prepareAvatarUpload(file: File): Promise<{ blob: Blob; contentType: string; ext: string }> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Formato inválido. Use PNG, JPG ou WebP.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Arquivo muito grande. Escolha uma imagem menor.");
  }

  const image = await loadImageFromFile(file);
  let mime = file.type;
  let quality = 0.92;
  let blob = await resizeImageToBlob(image, mime, quality);

  while (blob.size > MAX_UPLOAD_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await resizeImageToBlob(image, mime, quality);
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    mime = "image/webp";
    quality = 0.85;
    blob = await resizeImageToBlob(image, mime, quality);
    while (blob.size > MAX_UPLOAD_BYTES && quality > 0.5) {
      quality -= 0.1;
      blob = await resizeImageToBlob(image, mime, quality);
    }
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("Arquivo muito grande após compressão. Máximo 2MB.");
  }

  return { blob, contentType: mime, ext: extensionForMime(mime) };
}

export function getUserAvatarPublicUrl(
  avatarPath: string | null | undefined,
  updatedAt?: string | null,
): string | null {
  const path = avatarPath?.trim();
  if (!path) return null;

  const { data } = supabase.storage.from(USER_AVATARS_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) return null;

  if (updatedAt) {
    const version = encodeURIComponent(String(new Date(updatedAt).getTime()));
    return `${data.publicUrl}?v=${version}`;
  }

  return data.publicUrl;
}

export async function uploadUserAvatar(
  userId: string,
  file: File,
  currentAvatarPath?: string | null,
): Promise<string> {
  const { blob, contentType, ext } = await prepareAvatarUpload(file);
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(USER_AVATARS_BUCKET)
    .upload(path, blob, { upsert: true, contentType });

  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("lxp_profiles")
    .update({
      avatar_path: path,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) throw updateError;

  if (currentAvatarPath?.trim() && currentAvatarPath.trim() !== path) {
    await supabase.storage.from(USER_AVATARS_BUCKET).remove([currentAvatarPath.trim()]);
  }

  return path;
}

export async function removeUserAvatar(userId: string, avatarPath?: string | null): Promise<void> {
  if (avatarPath?.trim()) {
    const { error: storageError } = await supabase.storage
      .from(USER_AVATARS_BUCKET)
      .remove([avatarPath.trim()]);
    if (storageError) {
      console.warn("[avatarService] Falha ao remover arquivo do Storage:", storageError.message);
    }
  }

  const { error } = await supabase
    .from("lxp_profiles")
    .update({
      avatar_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}
