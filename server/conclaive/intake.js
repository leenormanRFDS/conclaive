import { generateStructured } from './geminiClient.js';
import { IntakeSchema } from './schemas.js';
import { INTAKE_SYSTEM } from './prompts.js';

export async function runIntake(question, context = '', requestedMode = 'STANDARD') {
  const prompt = `USER QUESTION TO RESOLVE:
"${question}"

${context ? `ADDITIONAL USER CONTEXT:\n${context}` : ''}

REQUESTED MODE:
${requestedMode}

Analyze this question:
1. Neutralize the question into a non-prescriptive, dialectical framing that does not assume the preferred outcome.
2. Identify problemType, decisionType, stakes, urgency, domains, and material stakeholders.
3. Identify underlying assumptions, unknowns, and potential biases.
4. Determine whether factual external evidence is required.
5. Evaluate whether REDLINE mode (high-scrutiny, existential risk, or acute urgency) must be activated.

Return valid JSON conforming to the schema.`;

  return await generateStructured({
    systemInstruction: INTAKE_SYSTEM,
    prompt,
    schema: IntakeSchema,
    thinkingLevel: 'LOW'
  });
}
