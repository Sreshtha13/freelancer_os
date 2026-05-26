import OpenAI from 'openai';
import { AI_CONFIG, SYSTEM_PROMPT } from '../config/ai.config.js';
import { AppError } from '../utils/AppError.js';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateCompletion(userPrompt, { tone, length }) {
  if (!openai) {
    throw new AppError(503, 'OpenAI is not configured');
  }

  const max_tokens = AI_CONFIG.lengthTokens[length] ?? AI_CONFIG.lengthTokens.medium;
  const toneInstruction = AI_CONFIG.toneInstructions[tone] ?? AI_CONFIG.toneInstructions.friendly;
  const lengthInstruction = AI_CONFIG.lengthInstructions[length] ?? AI_CONFIG.lengthInstructions.medium;

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.model,
    temperature: AI_CONFIG.temperature,
    max_tokens,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `${userPrompt}\n\nTone: ${toneInstruction}\nLength: ${lengthInstruction}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new AppError(502, 'Empty response from AI');
  }

  return {
    content,
    tokensUsed: response.usage?.total_tokens ?? 0,
    model: AI_CONFIG.model,
  };
}
