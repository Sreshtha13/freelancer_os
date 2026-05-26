# AI Proposal Generation — Prompt Design

## Model Configuration

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 1200,
  "response_format": { "type": "text" }
}
```

Length mapping:

| Setting | max_tokens | Instruction fragment |
|---------|------------|----------------------|
| short | 400 | "Keep under 150 words." |
| medium | 800 | "Aim for 250–350 words." |
| long | 1200 | "Aim for 450–600 words." |

Tone mapping:

| Tone | Instruction fragment |
|------|----------------------|
| formal | "Professional, concise, no slang. Use complete sentences." |
| friendly | "Warm and approachable while remaining professional." |
| confident | "Assertive, outcome-focused, highlight measurable results." |

---

## System Prompt (Template)

```
You are an expert freelance proposal writer. You write winning proposals for {{role}} freelancers.

Rules:
- Never fabricate specific metrics, client names, or employers not provided in the profile.
- Mirror keywords from the job description naturally (ATS-friendly) without keyword stuffing.
- Lead with relevance: why THIS freelancer fits THIS job in the first 2 sentences.
- Include a clear call-to-action (availability, next step).
- Do not mention you are an AI.
- Output ONLY the proposal text—no subject lines, metadata, or markdown headers unless the job context requires a subject line.
```

---

## User Prompt (Template)

```
## Job
Title: {{job.title}}
Source: {{job.source}}
Budget: {{job.budget}}
Tags: {{job.tags}}
Description:
{{job.description}}

## Freelancer Profile
Name: {{profile.display_name}}
Experience level: {{profile.experience_level}}
Skills: {{profile.skills}}
Bio: {{profile.bio}}
Portfolio: {{profile.portfolio_links}}

## Reference (optional past proposal style)
{{#if template}}
Use this saved template as structural inspiration (do not copy verbatim):
{{template.content}}
{{/if}}

## Instructions
Tone: {{tone}}
Length: {{length_instruction}}

Write a personalized proposal addressing the client's needs from the job description.
```

---

## Regeneration / Refinement Prompt

When user clicks "Make shorter" or "More technical":

```
Previous proposal:
---
{{previous_proposal}}
---

Revision request: {{revision_instruction}}

Rewrite the proposal applying the revision. Keep the same factual claims. Output only the proposal.
```

---

## Safety & Quality Filters

Post-generation checks (backend):

1. Reject if output contains `As an AI` / `language model`
2. Truncate if > 2× max_tokens equivalent length
3. Log token usage to `usage_counters` for billing

Pre-generation checks:

1. Job description min 50 chars
2. Profile must have ≥ 1 skill OR bio ≥ 100 chars

---

## Example Output Structure (friendly, medium)

```
Hi [Client name if inferable, else "there"],

[Hook: 1–2 sentences tying freelancer strength to job need]

[Body: 2–3 short paragraphs — approach, relevant experience, deliverables]

[Closing: availability + CTA]

Best,
{{profile.display_name}}
```

---

## Implementation Reference

See `backend/src/services/proposal.service.js` for `buildPrompt()` and `backend/src/config/ai.config.js` for constants.
