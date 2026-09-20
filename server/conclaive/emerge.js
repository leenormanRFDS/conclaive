import { generateStructured } from './geminiClient.js';
import { EmergenceSchema } from './schemas.js';
import { EMERGE_SYSTEM } from './prompts.js';

export async function runEmerge(originalQuestion, neutralQuestion, intake, deliberation, isDemo = false) {
  const prompt = `ORIGINAL QUESTION:
"${originalQuestion}"

NEUTRAL QUESTION:
"${neutralQuestion}"

INTAKE STAKES:
Stakes: ${intake.stakes}; Urgency: ${intake.urgency}

DELIBERATION RECORD:
Summary: ${deliberation.summary}
Friction Summary: ${deliberation.frictionSummary}
Strongest Argument FOR: ${deliberation.strongestArgumentFor}
Strongest Argument AGAINST: ${deliberation.strongestArgumentAgainst}
Areas of Disagreement: ${deliberation.areasOfDisagreement.join('; ')}
Material Unknowns: ${deliberation.materialUnknowns.join('; ')}
Unsupported Assumptions: ${deliberation.unsupportedAssumptions.join('; ')}
Questions Requiring Human Judgement: ${deliberation.questionsRequiringHumanJudgement.join('; ')}

${isDemo ? `CRITICAL DEMO REQUIREMENT (SELF-CRITIQUE OF CONCLAIVE):
This case examines CONCLAIVE’s own product thesis: "Can CONCLAIVE become something genuinely different from an AI chatbot?"
You MUST populate the 'selfCritiqueAnalysis' object with uncompromising candor:
- whatMakesConclaiveDifferent: Concrete attributes that separate genuine deliberation from conversational chatbots.
- whatRemainsMerelyMultiAgentPrompting: Where CONCLAIVE is in danger of being just multi-agent theatre or clever prompting.
- essentialUXFeatures: The non-negotiable UI/UX pillars (e.g. visible question transformation, table metaphor, explicit human decision gate, dialectic friction).
- whatShouldBeRemoved: Unnecessary feature bloat (e.g. agent selector dropdowns, conversational chat bubbles, token meters).
- smallestCompellingDemoMustProve: The single irreducible test the v1 demo must satisfy in front of an investor or enterprise buyer.
- whatShouldNotBeBuiltYet: Advanced enterprise features to ruthlessly defer (vector DBs, autonomous agents, multi-user rooms).` : ''}

STAGE E TASK — EMERGE:
Produce the POSITION EMERGED.
Do not deliver a complacent compromise or pretend certainty exists where it does not.
1. position: Choose ONE of:
   - PROCEED
   - PROCEED WITH CONDITIONS
   - MODIFY
   - INVESTIGATE
   - DEFER
   - DO NOT PROCEED
   - INSUFFICIENT EVIDENCE
2. basis: The rigorous dialectical justification for this position.
3. strongestSupport: What evidence or logic most compellingly supports this stance.
4. strongestObjection: What counter-position or hazard presents the gravest risk.
5. materialUncertainty: The fundamental irreducible uncertainty that cannot be calculated away.
6. unresolvedQuestions: 2-4 critical questions left open for human decision makers.
7. conditions: Clear, falsifiable conditions that must be fulfilled.
8. recommendedNextAction: The concrete first human move.
9. humanDecisionRequired: true (Always true).

Return valid JSON conforming to EmergenceSchema.`;

  return await generateStructured({
    systemInstruction: EMERGE_SYSTEM,
    prompt,
    schema: EmergenceSchema,
    thinkingLevel: 'HIGH'
  });
}
