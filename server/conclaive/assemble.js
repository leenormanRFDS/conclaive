import { generateStructured } from './geminiClient.js';
import { AssemblySchema } from './schemas.js';
import { ASSEMBLE_SYSTEM } from './prompts.js';

export const DEMO_SEATS = [
  {
    id: 'seat-01',
    name: 'ARCHITECT',
    type: 'CORE',
    discipline: 'Design & Coherence',
    objective: 'Remove unnecessary complexity; make the experience coherent, calm, and inevitable.',
    question: 'Where is the product introducing gratuitous cognitive clutter rather than clarifying the problem?',
    mandate: 'Guard the integrity of the physical/digital medium and ensure the experience feels inevitable.'
  },
  {
    id: 'seat-02',
    name: 'AI-NATIVE BUILDER',
    type: 'CORE',
    discipline: 'AI-Native Product Engineering',
    objective: 'Turn theoretical concepts into immediate, tactile, fast, and usable product loops.',
    question: 'How does this feel in the user’s hands within the first 10 seconds of interaction?',
    mandate: 'Prevent over-abstracted architecture; force the product to demonstrate real intelligence immediately.'
  },
  {
    id: 'seat-03',
    name: 'INTERACTION',
    type: 'CORE',
    discipline: 'Dynamic Mediums for Thought',
    objective: 'Challenge whether the interface creates a genuine medium for human thinking or merely decorates a chatbot.',
    question: 'Does this interface actually augment human cognition or is it theatrical simulation?',
    mandate: 'Abolish text boxes simulating chat; design the table as an intellectual instrument.'
  },
  {
    id: 'seat-04',
    name: 'MODEL ARCHITECT',
    type: 'CORE',
    discipline: 'Model Capabilities & Systems',
    objective: 'Allocate work correctly between software orchestration, model reasoning, and deterministic logic.',
    question: 'What belongs in deterministic software boundaries and what truly requires probabilistic reasoning?',
    mandate: 'Stop relying on prompt magic; engineer robust structured pipelines and state transitions.'
  },
  {
    id: 'seat-05',
    name: 'RED TEAM',
    type: 'CONTRARY',
    discipline: 'Adversarial Security & Rigor',
    objective: 'Attack prompt injection, contaminated context, false confidence, and systemic failure modes.',
    question: 'How can this system be fooled into manufacturing false consensus or hallucinating certainty?',
    mandate: 'Stress-test every assumption and expose vulnerabilities before they reach the human.'
  },
  {
    id: 'seat-06',
    name: 'RESPONSIBLE AI',
    type: 'CONTRARY',
    discipline: 'AI Governance & Human Agency',
    objective: 'Enforce accountability, contestability, auditability, and preservation of human decision authority.',
    question: 'Does the human retain authentic ownership of the decision, or is authority surreptitiously usurped?',
    mandate: 'Ensure that uncertainty is never concealed and that disagreement remains a first-class citizen.'
  },
  {
    id: 'seat-07',
    name: 'PRODUCT SYSTEMS',
    type: 'DYNAMIC',
    discipline: 'System Architecture & Viability',
    objective: 'Force the product to become a unified, scalable system rather than a fragmented collection of features.',
    question: 'Can this architecture sustain repeated high-stakes enterprise inquiries without collapsing into slop?',
    mandate: 'Tie the visual design, state engine, and backend contract into a single coherent entity.'
  },
  {
    id: 'seat-08',
    name: 'DISSENT',
    type: 'DISSENT',
    discipline: 'Fundamental Contrarian',
    objective: 'Challenge the core premise that multi-agent deliberation is any different from standard prompting.',
    question: 'Isn’t this whole experience merely elaborate multi-agent prompting with editorial styling?',
    mandate: 'Identify the perspective most dangerous to leave out and challenge the foundational conceit of CONCLAIVE.'
  }
];

export async function runAssemble(neutralQuestion, intake, isDemo = false) {
  if (isDemo) {
    return {
      rationale: 'Assembled the CONCLAIVE BUILD CONCLAVE: an 8-seat reference panel convened to subject CONCLAIVE’s own product thesis to the A–E protocol.',
      whoDangerousToLeaveOut: 'The Dissent seat challenging whether this is merely prompt choreography, and the Red Team auditing false consensus.',
      transformingQuestion: 'The question enters the Conclave: Can CONCLAIVE become something genuinely different from an AI chatbot?',
      seats: DEMO_SEATS
    };
  }

  const prompt = `NEUTRAL QUESTION:
"${neutralQuestion}"

INTAKE DIAGNOSIS:
Problem Type: ${intake.problemType}
Decision Type: ${intake.decisionType}
Stakes: ${intake.stakes}
Domains: ${intake.domains.join(', ')}
Stakeholders: ${intake.stakeholders.join(', ')}
Key Unknowns: ${intake.unknowns.join(', ')}

Assemble the Conclave for this problem:
1. Directly answer: "WHO WOULD BE DANGEROUS TO LEAVE OUT?"
2. Dynamically determine between 5 and 8 active seats.
3. Every seat must have: id (seat-01, seat-02...), name (UPPERCASE single or dual word), type ('CORE'|'DYNAMIC'|'CONTRARY'|'DISSENT'), discipline, objective, question, and mandate.
4. MANDATORY: Include a 'DISSENT' seat whose mandate is to challenge the consensus or identify the perspective most dangerous to omit.
5. Provide the transforming question for Stage A ("The question enters the Conclave: ...").

Return valid JSON conforming to the AssemblySchema.`;

  return await generateStructured({
    systemInstruction: ASSEMBLE_SYSTEM,
    prompt,
    schema: AssemblySchema,
    thinkingLevel: 'LOW'
  });
}
