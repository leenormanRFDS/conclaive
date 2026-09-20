import { generateStructured } from './geminiClient.js';
import { BroadenSchema } from './schemas.js';
import { BROADEN_SYSTEM } from './prompts.js';

export async function runBroaden(neutralQuestion, intake, seats, context = '') {
  const seatsSummary = seats.map(s => `[${s.id}] ${s.name} (${s.discipline}): ${s.mandate}. Core Question: "${s.question}"`).join('\n');

  const prompt = `NEUTRAL QUESTION:
"${neutralQuestion}"

${context ? `USER CONTEXT:\n${context}\n` : ''}
INTAKE CONSTRAINTS:
Problem Type: ${intake.problemType}
Embedded Assumptions: ${intake.assumptions.join('; ')}
Key Unknowns: ${intake.unknowns.join('; ')}

ASSEMBLED SEATS:
${seatsSummary}

STAGE B TASK — BROADEN:
1. Formulate how the question is broadened beyond its initial framing (e.g., "What conditions must be true for...").
2. For EVERY assembled seat, generate an independent, non-generic perspective:
   - position: Specific stance on the proposition from this discipline
   - reframe: How this seat expands or pivots the proposition
   - importantEvidence: Crucial empirical signals required
   - newConsideration: What the original question failed to contain
   - assumptionChallenged: Which embedded premise this seat attacks
   - questionForAnotherSeat: Pointed cross-table inquiry for another specific seat
   - uncertainty: The primary unresolved vulnerability acknowledged by this seat

Seats MUST NOT agree complacently. Reveal what the original question failed to contain.
Return valid JSON matching BroadenSchema.`;

  return await generateStructured({
    systemInstruction: BROADEN_SYSTEM,
    prompt,
    schema: BroadenSchema,
    thinkingLevel: 'MEDIUM'
  });
}
