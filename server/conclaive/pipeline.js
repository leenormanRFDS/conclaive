import { generateStructured } from './geminiClient.js';
import { IntakeSchema, Phase1Schema, Phase2Schema, Phase3Schema } from './schemas.js';
import { DEMO_SEATS } from './assemble.js';

export async function runPhase1(question, context = '', requestedMode = 'STANDARD', isDemo = false) {
  if (isDemo) {
    const prompt = `USER QUESTION TO RESOLVE:
"${question}"

${context ? `ADDITIONAL USER CONTEXT:\n${context}\n` : ''}
Analyze this question for Stage 0 (Intake):
1. Neutralize into a dialectical question that does not embed the preferred answer.
2. Classify problemType, decisionType, stakes, urgency, domains, stakeholders, assumptions, unknowns, and potentialBiases.
3. Evaluate if REDLINE mode should be active.

Output valid JSON matching IntakeSchema.`;

    const systemInstruction = `You are the CONCLAIVE Intake Engine.
CONCLAIVE is an intelligence environment for difficult questions.
Most AI is designed to answer. CONCLAIVE is designed to deliberate.
Stay with the question. Diagnose the problem type, stakes, and neutral dialectical question.
Return concise JSON matching IntakeSchema.`;

    const intake = await generateStructured({
      systemInstruction,
      prompt,
      schema: IntakeSchema,
      thinkingLevel: 'LOW'
    });

    const assembly = {
      rationale: 'Assembled the CONCLAIVE BUILD CONCLAVE: an 8-seat reference panel convened to subject CONCLAIVE’s own product thesis to the A–E protocol.',
      whoDangerousToLeaveOut: 'The Dissent seat challenging whether this is merely multi-agent prompt theatre, and the Red Team attacking false certainty.',
      transformingQuestion: 'The question enters the Conclave: Can CONCLAIVE become something genuinely different from an AI chatbot?',
      seats: DEMO_SEATS
    };

    return { intake, assembly };
  }

  const prompt = `USER QUESTION TO RESOLVE:
"${question}"

${context ? `ADDITIONAL USER CONTEXT:\n${context}\n` : ''}
REQUESTED MODE: ${requestedMode}

STAGE 0 (INTAKE) & STAGE A (ASSEMBLE):
1. Diagnose and Neutralize the Question:
   - neutralQuestion: Dialectical framing preventing user bias from becoming the path of least resistance.
   - problemType, decisionType, stakes, urgency, domains, stakeholders.
   - assumptions, unknowns, potentialBiases, externalEvidenceRequired, isRedline.
2. Assemble the Conclave:
   - Answer directly: "WHO WOULD BE DANGEROUS TO LEAVE OUT?"
   - Summon 5 to 8 seats dynamically with: id (seat-01...), name (UPPERCASE), type ('CORE'|'DYNAMIC'|'CONTRARY'|'DISSENT'), discipline, objective, question, and mandate.
   - Include a 'DISSENT' seat whose mandate is to challenge the consensus.
   - transformingQuestion: The question entering the Conclave.

Return valid JSON matching Phase1Schema.`;

  const systemInstruction = `You are the CONCLAIVE Intake and Assembly Engine.
CONCLAIVE is an intelligence environment for difficult questions.
Most AI is designed to answer. CONCLAIVE is designed to deliberate.
Stay with the question. Assemble who would be dangerous to leave out.
Output concise, information-dense JSON matching Phase1Schema.`;

  return await generateStructured({
    systemInstruction,
    prompt,
    schema: Phase1Schema,
    thinkingLevel: 'LOW'
  });
}

export async function runPhase2(neutralQuestion, intake, seats, context = '') {
  const seatsSummary = seats.map(s => `[${s.id}] ${s.name} (${s.discipline}): ${s.mandate}. Question: "${s.question}"`).join('\n');

  const prompt = `NEUTRAL QUESTION:
"${neutralQuestion}"

${context ? `USER CONTEXT:\n${context}\n` : ''}
INTAKE CONSTRAINTS:
Problem Type: ${intake.problemType}; Stakes: ${intake.stakes}
Assumptions: ${(intake.assumptions || []).join('; ')}
Unknowns: ${(intake.unknowns || []).join('; ')}

ASSEMBLED ROOM:
${seatsSummary}

STAGE B (BROADEN) & STAGE C (CHALLENGE):
1. Broaden:
   - questionReframing: How the question expands beyond initial premises.
   - perspectives: For each seat, provide position, reframe, importantEvidence, newConsideration, assumptionChallenged, questionForAnotherSeat, and uncertainty. Seats MUST NOT merely agree.
2. Challenge (Adversarial Scrutiny):
   - focalContradiction: The core tension exposed across the table.
   - assumptionDoingMostWork: The fragile premise threatening the proposition.
   - transformingQuestion: The question under adversarial attack.
   - challenges: For each seat, identify targetSeatOrAssumption, failureMode, assumptionTested, missingEvidence, contradictionFound, changedByEvidence, and underweightedRisk.

Return valid JSON matching Phase2Schema.`;

  const systemInstruction = `You are the CONCLAIVE Dialectic & Adversarial Engine.
In Stage B, broaden what the question failed to contain.
In Stage C, attack the proposition. Expose unexamined assumptions, contradictions, and failure modes.
Output rigorous, structured JSON matching Phase2Schema.`;

  return await generateStructured({
    systemInstruction,
    prompt,
    schema: Phase2Schema,
    thinkingLevel: 'LOW'
  });
}

export async function runPhase3(originalQuestion, neutralQuestion, intake, seats, broaden, challenge, isDemo = false) {
  const prompt = `ORIGINAL QUESTION:
"${originalQuestion}"

NEUTRAL QUESTION:
"${neutralQuestion}"

FOCAL CONTRADICTION:
"${challenge.focalContradiction}"

ASSUMPTION DOING MOST WORK:
"${challenge.assumptionDoingMostWork}"

STAGE D (DELIBERATE) & STAGE E (EMERGE):
1. Deliberate (Moderator Synthesis):
   - summary: Dialectic struggle overview.
   - frictionSummary: Bedrock friction point.
   - transformingQuestion: The question illuminated through friction.
   - areasOfAgreement: Shared ground.
   - areasOfDisagreement: Material disputes (disagreement is a valid output - preserve it).
   - strongestArgumentFor, strongestArgumentAgainst, materialUnknowns, unsupportedAssumptions, unresolvedConflicts, questionsRequiringHumanJudgement.
2. Emerge (Position Emerged):
   - position: Must be ONE of: 'PROCEED'|'PROCEED WITH CONDITIONS'|'MODIFY'|'INVESTIGATE'|'DEFER'|'DO NOT PROCEED'|'INSUFFICIENT EVIDENCE'.
   - basis: Defensible justification.
   - strongestSupport, strongestObjection, materialUncertainty.
   - unresolvedQuestions: 2-4 questions for human judgment.
   - conditions: Explicit requirements.
   - recommendedNextAction: First concrete human move.
   - humanDecisionRequired: true (Machine does not decide; human retains authority).

${isDemo ? `CRITICAL DEMO REQUIREMENT: Populate selfCritiqueAnalysis evaluating CONCLAIVE’s own product thesis with brutal candor:
- whatMakesConclaiveDifferent
- whatRemainsMerelyMultiAgentPrompting
- essentialUXFeatures
- whatShouldBeRemoved
- smallestCompellingDemoMustProve
- whatShouldNotBeBuiltYet` : ''}

Return valid JSON matching Phase3Schema.`;

  const systemInstruction = `You are the CONCLAIVE Deliberation and Emergence Engine.
Synthesize the dialectic friction without forcing false consensus.
Produce the POSITION EMERGED. The machine does not decide.
Return valid JSON matching Phase3Schema.`;

  return await generateStructured({
    systemInstruction,
    prompt,
    schema: Phase3Schema,
    thinkingLevel: 'HIGH'
  });
}
