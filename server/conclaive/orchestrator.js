import { runPhase1, runPhase2, runPhase3 } from './pipeline.js';
import { StageStatus } from './types.js';

/**
 * Executes a full CONCLAIVE deliberation case using structured 3-phase orchestration.
 * Emits fine-grained events for every stage and seat.
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {string} [params.context='']
 * @param {'STANDARD'|'REDLINE'} [params.mode='STANDARD']
 * @param {boolean} [params.isDemo=false]
 * @param {Function} [params.onEvent=()=>{}]
 * @returns {Promise<Object>} The ConclaveCase
 */
export async function runConclave({
  question,
  context = '',
  mode = 'STANDARD',
  isDemo = false,
  onEvent = () => {}
}) {
  const caseId = `case-${Date.now().toString(36).toUpperCase()}`;
  const createdAt = new Date().toISOString();

  const conclaveCase = {
    caseId,
    createdAt,
    originalQuestion: question,
    neutralQuestion: '',
    context,
    mode,
    stakes: 'Analyzing...',
    problemType: 'Classifying...',
    urgency: 'Standard',
    domains: [],
    stakeholders: [],
    assumptions: [],
    unknowns: [],
    potentialBiases: [],
    externalEvidenceRequired: false,
    seats: [],
    stages: {
      intake: StageStatus.NOT_STARTED,
      assemble: StageStatus.NOT_STARTED,
      broaden: StageStatus.NOT_STARTED,
      challenge: StageStatus.NOT_STARTED,
      deliberate: StageStatus.NOT_STARTED,
      emerge: StageStatus.NOT_STARTED
    },
    transformingQuestion: {
      stageA: '',
      stageB: '',
      stageC: '',
      stageD: '',
      stageE: ''
    },
    assembly: null,
    broaden: null,
    challenge: null,
    deliberation: null,
    emergence: null,
    decisionGate: {
      status: 'PENDING',
      humanDecision: null,
      notes: null,
      recordedAt: null
    }
  };

  onEvent('case.created', { caseId, createdAt, originalQuestion: question, mode });

  // === PHASE 1: INTAKE & ASSEMBLE ===
  try {
    conclaveCase.stages.intake = StageStatus.RUNNING;
    onEvent('stage.started', { stage: 'intake', label: 'Intake Diagnosis' });

    const phase1 = await runPhase1(question, context, mode, isDemo);
    const { intake, assembly } = phase1;

    conclaveCase.neutralQuestion = intake.neutralQuestion;
    conclaveCase.problemType = intake.problemType;
    conclaveCase.stakes = intake.stakes;
    conclaveCase.urgency = intake.urgency;
    conclaveCase.domains = intake.domains;
    conclaveCase.stakeholders = intake.stakeholders;
    conclaveCase.assumptions = intake.assumptions;
    conclaveCase.unknowns = intake.unknowns;
    conclaveCase.potentialBiases = intake.potentialBiases;
    conclaveCase.externalEvidenceRequired = intake.externalEvidenceRequired;

    if (intake.isRedline || mode === 'REDLINE') {
      conclaveCase.mode = 'REDLINE';
      conclaveCase.redlineReason = intake.redlineReason || 'High consequence and severe urgency detected.';
      onEvent('mode.redline_activated', { reason: conclaveCase.redlineReason });
    }

    conclaveCase.stages.intake = StageStatus.COMPLETE;
    onEvent('intake.completed', {
      neutralQuestion: conclaveCase.neutralQuestion,
      problemType: conclaveCase.problemType,
      stakes: conclaveCase.stakes,
      mode: conclaveCase.mode
    });

    // Stage A
    conclaveCase.stages.assemble = StageStatus.RUNNING;
    onEvent('stage.started', { stage: 'assemble', label: 'A — Assemble the Room' });

    conclaveCase.assembly = assembly;
    conclaveCase.seats = assembly.seats;
    conclaveCase.transformingQuestion.stageA = assembly.transformingQuestion || `The question enters the Conclave: ${conclaveCase.neutralQuestion}`;

    for (const seat of assembly.seats) {
      onEvent('seat.assembled', { seat });
    }

    conclaveCase.stages.assemble = StageStatus.COMPLETE;
    onEvent('stage.completed', {
      stage: 'assemble',
      seatCount: conclaveCase.seats.length,
      whoDangerousToLeaveOut: assembly.whoDangerousToLeaveOut,
      transformingQuestion: conclaveCase.transformingQuestion.stageA
    });
  } catch (err) {
    console.error('[CONCLAIVE] Phase 1 failed:', err);
    conclaveCase.stages.intake = StageStatus.FAILED;
    conclaveCase.stages.assemble = StageStatus.FAILED;
    conclaveCase.error = { stage: 'assemble', message: err.message };
    onEvent('stage.failed', { stage: 'assemble', message: err.message });
    throw err;
  }

  // Pacing for UI state transformation and rate-limit breathing room
  await new Promise(r => setTimeout(r, 4000));

  // === PHASE 2: BROADEN & CHALLENGE ===
  try {
    conclaveCase.stages.broaden = StageStatus.RUNNING;
    onEvent('stage.started', { stage: 'broaden', label: 'B — Broaden the Proposition' });

    const phase2 = await runPhase2(conclaveCase.neutralQuestion, conclaveCase, conclaveCase.seats, context);
    const { broaden, challenge } = phase2;

    conclaveCase.broaden = broaden;
    conclaveCase.transformingQuestion.stageB = broaden.questionReframing;

    for (const p of broaden.perspectives) {
      onEvent('seat.completed', {
        seatId: p.seatId,
        seatName: p.seatName,
        position: p.position,
        reframe: p.reframe
      });
    }

    conclaveCase.stages.broaden = StageStatus.COMPLETE;
    onEvent('stage.completed', {
      stage: 'broaden',
      transformingQuestion: conclaveCase.transformingQuestion.stageB
    });

    // Stage C
    conclaveCase.stages.challenge = StageStatus.RUNNING;
    onEvent('stage.started', { stage: 'challenge', label: 'C — Adversarial Scrutiny' });

    conclaveCase.challenge = challenge;
    conclaveCase.transformingQuestion.stageC = challenge.transformingQuestion;

    for (const ch of challenge.challenges) {
      onEvent('challenge.detected', {
        seatId: ch.seatId,
        seatName: ch.seatName,
        target: ch.targetSeatOrAssumption,
        failureMode: ch.failureMode,
        contradiction: ch.contradictionFound
      });
    }

    conclaveCase.stages.challenge = StageStatus.COMPLETE;
    onEvent('stage.completed', {
      stage: 'challenge',
      focalContradiction: challenge.focalContradiction,
      transformingQuestion: conclaveCase.transformingQuestion.stageC
    });
  } catch (err) {
    console.error('[CONCLAIVE] Phase 2 failed:', err);
    conclaveCase.stages.broaden = StageStatus.FAILED;
    conclaveCase.stages.challenge = StageStatus.FAILED;
    conclaveCase.error = { stage: 'challenge', message: err.message };
    onEvent('stage.failed', { stage: 'challenge', message: err.message });
    throw err;
  }

  // Pacing for UI state transformation and rate-limit breathing room
  await new Promise(r => setTimeout(r, 4000));

  // === PHASE 3: DELIBERATE & EMERGE ===
  try {
    conclaveCase.stages.deliberate = StageStatus.RUNNING;
    onEvent('stage.started', { stage: 'deliberate', label: 'D — Dialectic Deliberation' });

    const phase3 = await runPhase3(
      conclaveCase.originalQuestion,
      conclaveCase.neutralQuestion,
      conclaveCase,
      conclaveCase.seats,
      conclaveCase.broaden,
      conclaveCase.challenge,
      isDemo
    );
    const { deliberation, emergence } = phase3;

    conclaveCase.deliberation = deliberation;
    conclaveCase.transformingQuestion.stageD = deliberation.transformingQuestion;

    for (const disagreement of deliberation.areasOfDisagreement) {
      onEvent('disagreement.detected', { disagreement });
    }

    conclaveCase.stages.deliberate = StageStatus.COMPLETE;
    onEvent('stage.completed', {
      stage: 'deliberate',
      frictionSummary: deliberation.frictionSummary,
      transformingQuestion: conclaveCase.transformingQuestion.stageD
    });

    // Stage E
    conclaveCase.stages.emerge = StageStatus.RUNNING;
    onEvent('stage.started', { stage: 'emerge', label: 'E — Emergence' });

    conclaveCase.emergence = emergence;
    conclaveCase.transformingQuestion.stageE = `Position Emerged: ${emergence.position} — ${emergence.recommendedNextAction}`;

    onEvent('position.emerging', {
      position: emergence.position,
      basis: emergence.basis,
      recommendedNextAction: emergence.recommendedNextAction
    });

    conclaveCase.stages.emerge = StageStatus.COMPLETE;
    onEvent('stage.completed', {
      stage: 'emerge',
      position: emergence.position,
      transformingQuestion: conclaveCase.transformingQuestion.stageE
    });

    onEvent('human.decision_required', {
      caseId: conclaveCase.caseId,
      position: emergence.position,
      conditions: emergence.conditions,
      unresolvedQuestions: emergence.unresolvedQuestions
    });
  } catch (err) {
    console.error('[CONCLAIVE] Phase 3 failed:', err);
    conclaveCase.stages.deliberate = StageStatus.FAILED;
    conclaveCase.stages.emerge = StageStatus.FAILED;
    conclaveCase.error = { stage: 'emerge', message: err.message };
    onEvent('stage.failed', { stage: 'emerge', message: err.message });
    throw err;
  }

  return conclaveCase;
}
