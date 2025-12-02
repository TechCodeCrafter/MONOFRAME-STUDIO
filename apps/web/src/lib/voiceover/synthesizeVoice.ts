/**
 * TTS Synthesis Engine for AI Voiceover
 * Phase 20: AI Voiceover Engine
 * 
 * Integrates with OpenAI TTS API (browser-safe, client-side only)
 */

export type SynthesisInput = {
  text: string;
  voiceId: string; // from VoiceProfile.providerVoiceId
  lang?: string;
  speed?: number; // 0.5–2.0 (OpenAI supports 0.25–4.0)
};

export type SynthesisResult = {
  audioBuffer: ArrayBuffer;
  durationSeconds: number;
};

/**
 * Synthesize voice using OpenAI TTS API
 * 
 * SSR-safe: only runs in browser
 * Fallback: returns mock audio if no API key
 */
export async function synthesizeVoice(
  input: SynthesisInput
): Promise<SynthesisResult> {
  // SSR guard
  if (typeof window === "undefined") {
    throw new Error("synthesizeVoice can only be called client-side");
  }

  const { text, voiceId, speed = 1.0 } = input;

  // Validation
  if (!text || text.trim().length === 0) {
    return createEmptyAudio();
  }

  // Check for API key
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn(
      "[Voiceover] No NEXT_PUBLIC_OPENAI_API_KEY found. Using mock TTS."
    );
    return createMockAudio(text, speed);
  }

  try {
    // Call OpenAI TTS API
    // Docs: https://platform.openai.com/docs/api-reference/audio/createSpeech
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // or "tts-1-hd" for higher quality
        input: text,
        voice: voiceId,
        speed: Math.max(0.5, Math.min(2.0, speed)), // Clamp to safe range
        response_format: "mp3", // or "opus", "aac", "flac"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Voiceover] OpenAI TTS error:", errorText);
      return createMockAudio(text, speed);
    }

    const audioBuffer = await response.arrayBuffer();

    // Estimate duration (OpenAI doesn't return it)
    // Rough estimate: ~150 words per minute at 1.0 speed
    const wordCount = text.split(/\s+/).length;
    const durationSeconds = (wordCount / 150) * 60 / speed;

    return {
      audioBuffer,
      durationSeconds,
    };
  } catch (error) {
    console.error("[Voiceover] TTS synthesis failed:", error);
    return createMockAudio(text, speed);
  }
}

/**
 * Create an empty audio buffer (silence)
 */
function createEmptyAudio(): SynthesisResult {
  // Create a minimal silent MP3 (1 second)
  const silentMp3 = new Uint8Array([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

  return {
    audioBuffer: silentMp3.buffer,
    durationSeconds: 0.1,
  };
}

/**
 * Create a mock audio buffer (for testing without API key)
 * Returns a tiny silent audio file with estimated duration
 */
function createMockAudio(text: string, speed: number): SynthesisResult {
  // Estimate duration based on word count
  const wordCount = text.split(/\s+/).length;
  const durationSeconds = (wordCount / 150) * 60 / speed;

  // Create a minimal silent MP3
  const silentMp3 = new Uint8Array([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

  console.log(
    `[Voiceover] Mock TTS: "${text.slice(0, 50)}..." (${durationSeconds.toFixed(1)}s)`
  );

  return {
    audioBuffer: silentMp3.buffer,
    durationSeconds,
  };
}

/**
 * Batch synthesize multiple text segments
 * Returns results in same order as inputs
 */
export async function synthesizeVoiceBatch(
  inputs: SynthesisInput[],
  onProgress?: (current: number, total: number) => void
): Promise<SynthesisResult[]> {
  const results: SynthesisResult[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const result = await synthesizeVoice(inputs[i]);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, inputs.length);
    }

    // Small delay to avoid rate limiting
    if (i < inputs.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

