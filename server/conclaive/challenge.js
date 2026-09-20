import { generateStructured } from './geminiClient.js';
import { ChallengeSchema } from './schemas.js';
import { CHALLENGE_SYSTEM } from './prompts.js';

export async function runChallenge(neutralQuestion, intake, seats, broadenOutput) {
  const seatsContext = seats.map(s => {
    const persp = broadenOutput.perspectives.find(p => p.seatId === s.id) || {};
    return `SEAT [${s.id}] ${s.name}:
- Position: ${persp.position || 'N/A'}
- Reframe: ${persp.reframe || 'N/A'}
- New Consideration: ${persp.newConsideration || 'N/A'}
- Targeted Assumption: ${persp.assumptionChallenged || 'N/A'}`;
  }).join('\n\n');

  const prompt = `NEUTRAL QUESTION:
"${neutralQuestion}"

BROADENED QUESTION FRAMING:
"${broadenOutput.questionReframing}"

SEAT POSITIONS GENERATED IN STAGE B:
${seatsContext}

STAGE C TASK — CHALLENGE (ADVERSARIAL SCRUTINY):
Run the seats in adversarial mode. Attack the proposition. Expose fragile reasoning.
1. Identify the focalContradiction: The central tension emerging between seats.
2. Identify the assumptionDoingMostWork: The fragile premise that threatens the entire enterprise if false.
3. Formulate the transformingQuestion under attack (e.g. "What assumption would most likely make this fail?").
4. For each seat, document their sharp challenge:
   - targetSeatOrAssumption: The specific vulnerability or counter-perspective attacked
   - failureMode: Strongest plausible mechanism of failure in reality
   - assumptionTested: The assumption doing the most unexamined heavy lifting
   - missingEvidence: Crucial empirical validation that is completely absent
   - contradictionFound: Inherent contradiction or logical gap
   - changedByEvidence: Specific test or data that would force this seat to alter its position
   - underweightedRisk: A critical risk another seat is dangerously dismissing or ignoring

Return valid JSON matching ChallengeSchema.`;

  return await generateStructured({
    systemInstruction: CHALLENGE_SYSTEM,
    prompt,
    schema: ChallengeSchema,
    thinkingLevel: 'HIGH'
  });
}
