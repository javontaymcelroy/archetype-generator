import type { ArchetypeState } from '../types';

export const MODELS = [
  { id: 'o4-mini',  label: 'o4-mini  · fast reasoning' },
  { id: 'o3-mini',  label: 'o3-mini  · reasoning' },
  { id: 'o1',       label: 'o1       · deep reasoning' },
  { id: 'gpt-4o',   label: 'gpt-4o   · no reasoning' },
] as const;

export type ModelId = (typeof MODELS)[number]['id'];

export interface AIArchetype {
  corePattern: string;
  tensionPair: string;
  behaviorPattern: string;
  feedbackLoop: string;
  failureMode: string;
  valueConflict: string;
}

function buildPrompt(s: ArchetypeState): string {
  return `You are a behavioral archetype resolution engine. Given 9 axis values from a generative system, produce precise psychological pattern descriptions. No specific nouns, no story elements — abstract behavioral truths only. Each description must logically derive from the inputs.

AXIS VALUES:
- Primary Motivation (why it moves): ${s.primaryMotivation}
- Counter-Motivation (what opposes it): ${s.counterMotivation}
- Target (where intent is aimed): ${s.target}
- Distortion (how it fails): ${s.distortion}
- Behavior (what it looks like): ${s.behavior}
- Intensity: ${s.intensity}
- Awareness: ${s.awareness}
- Justification (internal narrative): "${s.justification}"
- Pressure (forcing function): ${s.pressure}

Return ONLY a valid JSON object with exactly these six fields:

{
  "corePattern": "One sentence. How ${s.primaryMotivation} aimed at ${s.target} becomes ${s.distortion}, manifesting as ${s.behavior}.",
  "tensionPair": "One sentence. The internal conflict between ${s.primaryMotivation} and ${s.counterMotivation} — what they cannot both satisfy.",
  "behaviorPattern": "2-3 sentences. How ${s.behavior} appears at ${s.intensity} intensity with ${s.awareness} awareness of its own root.",
  "feedbackLoop": "2 sentences. How ${s.behavior} reinforces itself; incorporate the justification '${s.justification}' as the belief that absorbs consequences.",
  "failureMode": "One sentence. What collapses this pattern under ${s.pressure} pressure.",
  "valueConflict": "One sentence. The gap between declared ${s.primaryMotivation} values and actual ${s.behavior} directed ${s.target === 'Self' ? 'inward' : 'outward'}."
}`;
}

export async function generateWithOpenAI(
  state: ArchetypeState,
  apiKey: string,
  model: ModelId,
): Promise<AIArchetype> {
  const body: Record<string, unknown> = {
    model,
    messages: [{ role: 'user', content: buildPrompt(state) }],
  };

  // Reasoning models use max_completion_tokens; standard models use max_tokens
  if (model === 'gpt-4o') {
    body.max_tokens = 900;
    body.response_format = { type: 'json_object' };
  } else {
    body.max_completion_tokens = 1200;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `OpenAI error ${res.status}`);
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? '';

  // Extract JSON — reasoning models sometimes wrap it in markdown
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in model response');

  return JSON.parse(match[0]) as AIArchetype;
}
