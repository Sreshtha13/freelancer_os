export const AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  lengthTokens: {
    short: 400,
    medium: 800,
    long: 1200,
  },
  lengthInstructions: {
    short: 'Keep under 150 words.',
    medium: 'Aim for 250–350 words.',
    long: 'Aim for 450–600 words.',
  },
  toneInstructions: {
    formal: 'Professional, concise, no slang.',
    friendly: 'Warm and approachable while remaining professional.',
    confident: 'Assertive, outcome-focused, highlight measurable results.',
  },
};

export const SYSTEM_PROMPT = `You are an expert freelance proposal writer.

Rules:
- Never fabricate metrics, client names, or employers not in the profile.
- Mirror job keywords naturally without stuffing.
- Lead with relevance in the first 2 sentences.
- Include a clear call-to-action.
- Do not mention you are an AI.
- Output ONLY the proposal text.`;
