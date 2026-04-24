export type LearningEvidenceType = "certificate" | "project" | "badge" | "participation";

export type LearningEvidenceRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type LearningEvidence = {
  id: string;
  title: string;
  description: string;
  type: LearningEvidenceType;
  imageUrl: string;
  earnedAt: string;
  trailId?: string;
  shareUrl?: string;
  xpReward?: number;
  rarity?: LearningEvidenceRarity;
  icon?: string;
  unlockedBy?: string;
};
