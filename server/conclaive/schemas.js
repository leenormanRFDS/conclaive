import { z } from 'zod';

export const IntakeSchema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    if (!data.neutralQuestion) {
      data.neutralQuestion = data.neutral_question || data.neutralizedQuestion || data.reframeQuestion || data.neutralized_question || 'What conditions would justify or invalidate this proposition?';
    }
  }
  return data;
}, z.object({
  problemType: z.string().default('Strategic Problem'),
  decisionType: z.string().default('Strategic Commitment'),
  stakes: z.string().default('High'),
  urgency: z.string().default('Standard'),
  domains: z.array(z.string()).default(['Strategy', 'Systems']),
  stakeholders: z.array(z.string()).default(['Core Decision Makers']),
  assumptions: z.array(z.string()).default(['Premises require testing']),
  unknowns: z.array(z.string()).default(['Critical empirical variables']),
  potentialBiases: z.array(z.string()).default(['Outcome preference bias']),
  externalEvidenceRequired: z.boolean().default(true),
  isRedline: z.boolean().default(false),
  redlineReason: z.string().nullable().optional(),
  neutralQuestion: z.string().default('What conditions would justify or invalidate this proposition?')
}));

export const SeatDefinitionSchema = z.object({
  id: z.string().default(() => `seat-${Math.random().toString(36).slice(2, 6)}`),
  name: z.string(),
  type: z.string().default('CORE'),
  discipline: z.string().default('Core Scrutiny'),
  objective: z.string().default('Examine problem from this discipline'),
  question: z.string().default('What does this discipline require?'),
  mandate: z.string().default('Provide specialized scrutiny')
});

export const AssemblySchema = z.object({
  rationale: z.string().default('Assembled relevant disciplines for deliberation.'),
  whoDangerousToLeaveOut: z.string().default('Dissenting and adversarial perspectives.'),
  transformingQuestion: z.string().default('The question enters the Conclave.'),
  seats: z.array(SeatDefinitionSchema).min(3).max(8)
});

export const SeatPerspectiveSchema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    const seatName = data.seatName || data.name || data.seat || data.discipline || data.title || 'Disciplinary Perspective';
    const pos = data.position || data.reframe || data.perspective || data.viewpoint || data.thesis || 'Disciplinary perspective on proposition';
    const ref = data.reframe || data.position || data.perspective || pos;
    return {
      seatId: String(data.seatId || data.id || 'seat-01'),
      seatName: String(seatName),
      position: String(pos),
      reframe: String(ref),
      importantEvidence: String(data.importantEvidence || data.evidence || data.keyEvidence || 'Empirical validation required'),
      newConsideration: String(data.newConsideration || data.consideration || data.friction || 'Unexamined systemic friction'),
      assumptionChallenged: String(data.assumptionChallenged || data.assumption || 'Baseline premise'),
      questionForAnotherSeat: String(data.questionForAnotherSeat || data.question || 'How does this perspective reconcile with practical constraints?'),
      uncertainty: String(data.uncertainty || data.materialUncertainty || 'Empirical uncertainty')
    };
  }
  return {
    seatId: 'seat-01',
    seatName: 'Disciplinary Perspective',
    position: 'Disciplinary perspective on proposition',
    reframe: 'Broadened proposition',
    importantEvidence: 'Empirical validation required',
    newConsideration: 'Unexamined systemic friction',
    assumptionChallenged: 'Baseline premise',
    questionForAnotherSeat: 'How does this perspective reconcile with practical constraints?',
    uncertainty: 'Empirical uncertainty'
  };
}, z.object({
  seatId: z.string().default('seat-01'),
  seatName: z.string().default('Disciplinary Perspective'),
  position: z.string().default('Disciplinary position'),
  reframe: z.string().default('Broadened proposition'),
  importantEvidence: z.string().default('Observed empirical validation'),
  newConsideration: z.string().default('Unexamined systemic friction'),
  assumptionChallenged: z.string().default('Core baseline presumption'),
  questionForAnotherSeat: z.string().default('How does your discipline account for this constraint?'),
  uncertainty: z.string().default('Empirical market or technical uncertainty')
}));

export const BroadenSchema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    const questionReframing = data.questionReframing || data.reframing || data.broadenedQuestion || data.reframe || 'How the proposition expands beyond its initial boundaries.';
    const rawList = data.perspectives || data.seats || data.perspectivesList || [];
    const perspectives = Array.isArray(rawList) ? rawList : [];
    return {
      questionReframing,
      perspectives
    };
  }
  return { questionReframing: 'How the proposition is broadened beyond its initial premises.', perspectives: [] };
}, z.object({
  questionReframing: z.string().default('How the proposition is broadened beyond its initial premises.'),
  perspectives: z.array(SeatPerspectiveSchema).default([])
}));

export const SeatChallengeSchema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    const seatName = data.seatName || data.name || data.seat || data.discipline || data.title || 'Adversarial Seat';
    const failureMode = data.failureMode || data.challenge || data.attack || data.criticism || data.vulnerability || 'Critical point of failure under pressure';
    return {
      seatId: String(data.seatId || data.id || 'seat-01'),
      seatName: String(seatName),
      targetSeatOrAssumption: String(data.targetSeatOrAssumption || data.target || data.assumptionTested || 'Core proposition'),
      failureMode: String(failureMode),
      assumptionTested: String(data.assumptionTested || data.assumption || 'Baseline premise'),
      missingEvidence: String(data.missingEvidence || data.evidenceMissing || 'Absence of empirical confirmation'),
      contradictionFound: String(data.contradictionFound || data.contradiction || 'Inherent tension between objectives'),
      changedByEvidence: String(data.changedByEvidence || data.counterEvidence || 'Controlled empirical validation data'),
      underweightedRisk: String(data.underweightedRisk || data.risk || 'Systemic friction')
    };
  }
  return {
    seatId: 'seat-01',
    seatName: 'Adversarial Seat',
    targetSeatOrAssumption: 'Core proposition',
    failureMode: 'Critical failure mode under pressure',
    assumptionTested: 'Baseline premise',
    missingEvidence: 'Absence of empirical confirmation',
    contradictionFound: 'Inherent tension between objectives',
    changedByEvidence: 'Controlled empirical validation data',
    underweightedRisk: 'Systemic friction'
  };
}, z.object({
  seatId: z.string().default('seat-01'),
  seatName: z.string().default('Adversarial Seat'),
  targetSeatOrAssumption: z.string().default('Core proposition'),
  failureMode: z.string().default('Critical failure mode identified under pressure'),
  assumptionTested: z.string().default('Baseline execution premise'),
  missingEvidence: z.string().default('Absence of empirical confirmation'),
  contradictionFound: z.string().default('Inherent tension between objectives'),
  changedByEvidence: z.string().default('Controlled empirical validation data'),
  underweightedRisk: z.string().default('Systemic adoption resistance')
}));

export const ChallengeSchema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    const focalContradiction = data.focalContradiction || data.contradiction || data.tension || data.coreTension || 'Irreducible tension between primary objectives.';
    const assumptionDoingMostWork = data.assumptionDoingMostWork || data.mostVulnerableAssumption || data.assumption || 'Baseline premise carrying highest consequence.';
    const transformingQuestion = data.transformingQuestion || 'The question under adversarial scrutiny.';
    const rawList = data.challenges || data.seats || data.attacks || [];
    const challenges = Array.isArray(rawList) ? rawList : [];
    return {
      focalContradiction,
      assumptionDoingMostWork,
      transformingQuestion,
      challenges
    };
  }
  return {
    focalContradiction: 'Tension between core assumptions.',
    assumptionDoingMostWork: 'The premise that carries greatest consequence if false.',
    transformingQuestion: 'The question under adversarial scrutiny.',
    challenges: []
  };
}, z.object({
  focalContradiction: z.string().default('Tension between core assumptions.'),
  assumptionDoingMostWork: z.string().default('The premise that carries the greatest risk if false.'),
  transformingQuestion: z.string().default('The question under adversarial scrutiny.'),
  challenges: z.array(SeatChallengeSchema).default([])
}));

export const DeliberationSchema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    if (!data.frictionSummary && data.summary) data.frictionSummary = data.summary;
    if (!data.summary && data.frictionSummary) data.summary = data.frictionSummary;
    if (!data.strongestArgumentFor) data.strongestArgumentFor = 'Substantive alignment across core operational parameters.';
    if (!data.strongestArgumentAgainst) data.strongestArgumentAgainst = 'Material operational and cognitive risks remain unmitigated.';
  }
  return data;
}, z.object({
  summary: z.string().default('Dialectic deliberation synthesis.'),
  frictionSummary: z.string().default('Frictional tension exposed during deliberation.'),
  transformingQuestion: z.string().default('The question illuminated through friction.'),
  areasOfAgreement: z.array(z.string()).default([]),
  areasOfDisagreement: z.array(z.string()).default([]),
  strongestArgumentFor: z.string().default('Primary argument supporting progression.'),
  strongestArgumentAgainst: z.string().default('Primary objection demanding mitigation.'),
  materialUnknowns: z.array(z.string()).default([]),
  unsupportedAssumptions: z.array(z.string()).default([]),
  unresolvedConflicts: z.array(z.string()).default([]),
  questionsRequiringHumanJudgement: z.array(z.string()).default([])
}));

export const EmergenceSchema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    if (!data.position) data.position = 'PROCEED WITH CONDITIONS';
    if (!data.basis) data.basis = data.rationale || data.reasoning || 'Defensible basis for current position.';
    if (!data.strongestSupport) data.strongestSupport = data.support || 'Core affirmative findings.';
    if (!data.strongestObjection) data.strongestObjection = data.objection || 'Primary counterweight.';
    if (!data.materialUncertainty) data.materialUncertainty = data.uncertainty || 'Empirical unknown.';
    if (!data.recommendedNextAction) data.recommendedNextAction = data.nextAction || 'Empirical review before commitment.';
  }
  return data;
}, z.object({
  position: z.string().default('PROCEED WITH CONDITIONS'),
  basis: z.string().default('Defensible position based on assembled perspectives.'),
  strongestSupport: z.string().default('Validated affirmative considerations.'),
  strongestObjection: z.string().default('Material counterweights identified in challenge.'),
  materialUncertainty: z.string().default('Variables requiring human empirical confirmation.'),
  unresolvedQuestions: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  recommendedNextAction: z.string().default('Execute initial exploratory validation.'),
  humanDecisionRequired: z.literal(true).default(true),
  selfCritiqueAnalysis: z.object({
    whatMakesConclaiveDifferent: z.string().default('Dialectic deliberation and friction preservation instead of sycophantic chatbot consensus.'),
    whatRemainsMerelyMultiAgentPrompting: z.string().default('Orchestration without genuine cognitive tension or irreversible stakes.'),
    essentialUXFeatures: z.array(z.string()).default(['Transforming question banner', 'The Table metaphor', 'Human decision gate']),
    whatShouldBeRemoved: z.array(z.string()).default(['Agent selectors', 'Chat transcript bubbles', 'Synthesized fake consensus']),
    smallestCompellingDemoMustProve: z.string().default('A question entered, transformed through conflict, and emerged as a defensible position.'),
    whatShouldNotBeBuiltYet: z.array(z.string()).default(['Complex vector stores', 'Autonomous unbounded agent swarms'])
  }).optional()
}));

export const Phase1Schema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    if (!data.intake && data.neutralQuestion) data = { intake: data, assembly: data.assembly || {} };
  }
  return data;
}, z.object({
  intake: IntakeSchema,
  assembly: AssemblySchema
}));

export const Phase2Schema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    // If model returned a flattened object or top-level properties
    const broadenData = data.broaden || {
      questionReframing: data.questionReframing || data.broadenedQuestion || data.reframe,
      perspectives: data.perspectives || data.seats || []
    };
    const challengeData = data.challenge || {
      focalContradiction: data.focalContradiction || data.contradiction || data.tension,
      assumptionDoingMostWork: data.assumptionDoingMostWork || data.assumption,
      transformingQuestion: data.transformingQuestion,
      challenges: data.challenges || (data.challenge && data.challenge.challenges) || []
    };
    return {
      broaden: broadenData,
      challenge: challengeData
    };
  }
  return { broaden: {}, challenge: {} };
}, z.object({
  broaden: BroadenSchema,
  challenge: ChallengeSchema
}));

export const Phase3Schema = z.preprocess((data) => {
  if (data && typeof data === 'object') {
    const deliberationData = data.deliberation || {
      summary: data.summary || data.frictionSummary,
      frictionSummary: data.frictionSummary || data.summary,
      transformingQuestion: data.transformingQuestion,
      areasOfAgreement: data.areasOfAgreement || [],
      areasOfDisagreement: data.areasOfDisagreement || [],
      strongestArgumentFor: data.strongestArgumentFor,
      strongestArgumentAgainst: data.strongestArgumentAgainst,
      materialUnknowns: data.materialUnknowns || [],
      unsupportedAssumptions: data.unsupportedAssumptions || [],
      unresolvedConflicts: data.unresolvedConflicts || [],
      questionsRequiringHumanJudgement: data.questionsRequiringHumanJudgement || []
    };
    const emergenceData = data.emergence || {
      position: data.position,
      basis: data.basis,
      strongestSupport: data.strongestSupport,
      strongestObjection: data.strongestObjection,
      materialUncertainty: data.materialUncertainty,
      unresolvedQuestions: data.unresolvedQuestions || [],
      conditions: data.conditions || [],
      recommendedNextAction: data.recommendedNextAction,
      selfCritiqueAnalysis: data.selfCritiqueAnalysis
    };
    return {
      deliberation: deliberationData,
      emergence: emergenceData
    };
  }
  return { deliberation: {}, emergence: {} };
}, z.object({
  deliberation: DeliberationSchema,
  emergence: EmergenceSchema
}));
