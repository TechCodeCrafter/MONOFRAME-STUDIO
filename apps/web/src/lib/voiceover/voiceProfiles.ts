/**
 * Voice Profile Definitions for AI Voiceover
 * Phase 20: AI Voiceover Engine
 */

export type VoiceProfile = {
  id: string;
  label: string;
  description: string;
  gender?: "male" | "female" | "neutral";
  style?: "cinematic" | "conversational" | "tutorial" | "promo";
  lang: string;
  providerVoiceId?: string; // Maps to OpenAI TTS voice names
};

/**
 * Predefined voice profiles for MonoFrame AI Voiceover
 * 
 * OpenAI TTS voice options:
 * - alloy (neutral)
 * - echo (male)
 * - fable (neutral)
 * - onyx (male, deep)
 * - nova (female, warm)
 * - shimmer (female, bright)
 */
export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "cinematic_male",
    label: "Cinematic Male",
    description: "Deep, cinematic trailer-style narration.",
    gender: "male",
    style: "cinematic",
    lang: "en-US",
    providerVoiceId: "onyx", // OpenAI TTS
  },
  {
    id: "warm_female",
    label: "Warm Female",
    description: "Warm, friendly explainer tone.",
    gender: "female",
    style: "tutorial",
    lang: "en-US",
    providerVoiceId: "nova", // OpenAI TTS
  },
  {
    id: "neutral_narrator",
    label: "Neutral Narrator",
    description: "Clean, neutral narration for product demos.",
    gender: "neutral",
    style: "conversational",
    lang: "en-US",
    providerVoiceId: "alloy", // OpenAI TTS
  },
  {
    id: "bright_female",
    label: "Bright Female",
    description: "Energetic, upbeat narrator for promos.",
    gender: "female",
    style: "promo",
    lang: "en-US",
    providerVoiceId: "shimmer", // OpenAI TTS
  },
  {
    id: "storyteller_male",
    label: "Storyteller Male",
    description: "Resonant storytelling voice.",
    gender: "male",
    style: "conversational",
    lang: "en-US",
    providerVoiceId: "echo", // OpenAI TTS
  },
  {
    id: "documentary_neutral",
    label: "Documentary Neutral",
    description: "Authoritative documentary narration.",
    gender: "neutral",
    style: "tutorial",
    lang: "en-US",
    providerVoiceId: "fable", // OpenAI TTS
  },
];

/**
 * Get voice profile by ID
 */
export function getVoiceProfile(id: string): VoiceProfile | undefined {
  return VOICE_PROFILES.find((profile) => profile.id === id);
}

/**
 * Get default voice profile
 */
export function getDefaultVoiceProfile(): VoiceProfile {
  return VOICE_PROFILES[2]; // neutral_narrator
}

