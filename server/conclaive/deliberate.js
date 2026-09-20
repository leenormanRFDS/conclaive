import { generateStructured } from './geminiClient.js';
import { DeliberationSchema } from './schemas.js';
import { DELIBERATE_SYSTEM } from './prompts.js';

export async function runDeliberate(originalQuestion, neutralQuestion, seats, broadenOutput, challengeOutput) {
  const challengesSummary = challengeOutput.challenges.map(c => 
    `[${c.seatName}]: Targets "${c.targetSeatOrAssumption}". Failure Mode: ${c.failureMode}. Missing Evidence: ${c.missingEvidence}. Contradiction: ${c.contradictionFound}`
  ).join('\n');

  const prompt = `ORIGINAL QUESTION:
"${originalQuestion}"

NEUTRAL QUESTION:
"${neutralQuestion}"

FOCAL CONTRADICTION IDENTIFIED:
"${challengeOutput.focalContradiction}"

KEY ASSUMPTION DOING MOST WORK:
"${challengeOutput.assumptionDoingMostWork}"

ADVERSARIAL CHALLENGES:
${challengesSummary}

STAGE D TASK — DELIBERATE:
The Conclave moderator must synthesize the deliberation without forcing artificial consensus.
1. summary: Concise synthesis of the dialectic struggle.
2. frictionSummary: Where the debate struck bedrock friction and why.
3. transformingQuestion: The question illuminated through deliberation (e.g. "Is value created through rapid distribution or fundamental differentiation?").
4. areasOfAgreement: Ground shared across seats.
5. areasOfDisagreement: Material disputes that remain unresolved (preserve these faithfully).
6. strongestArgumentFor: The most defensible, robust case in favor of moving forward.
7. strongestArgumentAgainst: The most formidable counter-argument or systemic vulnerability.
8. materialUnknowns: Empirical facts that cannot be resolved without observation or market test.
9. unsupportedAssumptions: Assertions made by seats that lack supporting proof.
10. unresolvedConflicts: Incompatible objectives between disciplines (e.g. governance vs speed).
11. questionsRequiringHumanJudgement: Questions where computation ends and human accountability begins.

Return valid JSON matching DeliberationSchema.`;

  return await generateStructured({
    systemInstruction: DELIBERATE_SYSTEM,
    prompt,
    schema: DeliberationSchema,
    thinkingLevel: 'HIGH'
  });
}
