export const STORAGE_BUCKETS = {
  userAvatars: "user-avatars",
  disciplineCovers: "discipline-covers",
  certificateSignatures: "certificate-signatures",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
