import { supabaseAdmin } from '../config/supabase.js';
import { generateCompletion } from './openai.service.js';
import { checkProposalQuota, incrementProposalUsage } from './usage.service.js';
import { AppError } from '../utils/AppError.js';

export function buildProposalPrompt({ job, profile, template }) {
  const portfolio =
    Array.isArray(profile.portfolio_links) && profile.portfolio_links.length
      ? profile.portfolio_links.map((p) => p.url || p).join(', ')
      : 'N/A';

  let prompt = `## Job
Title: ${job.title}
Source: ${job.source}
Budget: ${job.budget || 'Not specified'}
Tags: ${(job.tags || []).join(', ')}
Description:
${job.description || 'No description provided.'}

## Freelancer Profile
Name: ${profile.display_name || 'Freelancer'}
Experience: ${profile.experience_level || 'mid'}
Skills: ${(profile.skills || []).join(', ')}
Bio: ${profile.bio || ''}
Portfolio: ${portfolio}`;

  if (template?.content) {
    prompt += `\n\n## Template inspiration (do not copy verbatim)\n${template.content}`;
  }

  prompt += '\n\nWrite a personalized proposal addressing the client needs.';
  return prompt;
}

export async function generateProposal(userId, { jobId, tone, length, templateId }) {
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    throw new AppError(404, 'Profile not found');
  }

  const hasSkills = profile.skills?.length > 0;
  const hasBio = (profile.bio || '').length >= 100;
  if (!hasSkills && !hasBio) {
    throw new AppError(400, 'Add skills or a bio (100+ chars) before generating proposals');
  }

  const quota = await checkProposalQuota(userId, profile.plan);
  if (!quota.allowed) {
    throw new AppError(402, `Monthly proposal limit reached (${quota.limit}). Upgrade to Pro.`);
  }

  const { data: job, error: jobErr } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();

  if (jobErr || !job) {
    throw new AppError(404, 'Job not found');
  }

  if ((job.description || '').length < 50 && !job.title) {
    throw new AppError(400, 'Job needs a description (50+ chars) or detailed title');
  }

  let template = null;
  if (templateId) {
    const { data } = await supabaseAdmin
      .from('proposal_templates')
      .select('content')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();
    template = data;
  }

  const userPrompt = buildProposalPrompt({ job, profile, template });
  const ai = await generateCompletion(userPrompt, { tone, length });

  const { data: proposal, error: saveErr } = await supabaseAdmin
    .from('proposals')
    .insert({
      user_id: userId,
      job_id: jobId,
      content: ai.content,
      tone,
      length,
      model: ai.model,
      tokens_used: ai.tokensUsed,
      title: `Proposal for ${job.title}`,
    })
    .select()
    .single();

  if (saveErr) {
    throw new AppError(500, 'Failed to save proposal');
  }

  await incrementProposalUsage(userId);

  return { proposal, tokensUsed: ai.tokensUsed, quotaRemaining: quota.remaining - 1 };
}
