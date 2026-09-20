import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let aiInstance = null;

export function getGenAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FLASH_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

/**
 * Call Gemini with structured JSON validation and model tier failover.
 * Prioritizes gemini-3.8-flash as required; if project daily quota limit is reached,
 * seamlessly cascades through Gemini Flash models so the Conclave never halts.
 *
 * @param {Object} options
 * @param {string} options.systemInstruction
 * @param {string} options.prompt
 * @param {import('zod').ZodType} options.schema
 * @param {'LOW'|'MEDIUM'|'HIGH'} [options.thinkingLevel='LOW']
 * @returns {Promise<any>}
 */
export async function generateStructured({ systemInstruction, prompt, schema, thinkingLevel = 'LOW' }) {
  const ai = getGenAI();

  const levelMap = {
    LOW: ThinkingLevel.LOW,
    MEDIUM: ThinkingLevel.MEDIUM,
    HIGH: ThinkingLevel.HIGH
  };

  let currentThinking = levelMap[thinkingLevel] || ThinkingLevel.LOW;

  const tryCallSingle = async (modelName, contents, maxRetries = 2) => {
    let lastErr = null;
    for (let i = 1; i <= maxRetries; i++) {
      try {
        const config = {
          systemInstruction,
          responseMimeType: 'application/json'
        };
        // Some models or legacy versions only support thinkingConfig if configured
        if (currentThinking && !modelName.includes('latest')) {
          config.thinkingConfig = { thinkingLevel: currentThinking };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config
        });
        return response.text;
      } catch (err) {
        lastErr = err;
        const msg = err && (err.message || String(err));

        // If daily limit exhausted or model capacity full, break to cascade immediately
        if (msg.includes('GenerateRequestsPerDay') || (msg.includes('RESOURCE_EXHAUSTED') && msg.includes('limit: 20'))) {
          throw err;
        }

        const is503 = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');
        if (is503 && i < maxRetries) {
          currentThinking = ThinkingLevel.LOW;
          const wait = i * 1500;
          console.warn(`[CONCLAIVE] ${modelName} 503 spike, retrying in ${wait}ms...`);
          await sleep(wait);
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  };

  const execute = async (contents) => {
    let lastErr = null;
    for (const modelName of FLASH_MODELS) {
      try {
        return await tryCallSingle(modelName, contents);
      } catch (err) {
        lastErr = err;
        const msg = err && (err.message || String(err));
        console.warn(`[CONCLAIVE] Model ${modelName} reached quota/capacity limit (${msg.slice(0, 60)}...). Cascading to next Flash tier...`);
      }
    }
    throw lastErr;
  };

  let rawText = '';
  try {
    rawText = await execute(prompt);
  } catch (netErr) {
    console.error('[CONCLAIVE] Model cascade failed:', netErr.message);
    throw new Error(`Model service temporarily unavailable (${netErr.message})`);
  }

  // Parse and validate with Zod
  try {
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      const cleaned = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    }
    return schema.parse(parsed);
  } catch (schemaErr) {
    console.warn('[CONCLAIVE] JSON schema parse error, applying repair:', schemaErr.message);

    const repairPrompt = `You produced the following JSON output which failed validation against the required schema:
${rawText}

Validation error:
${schemaErr.message}

Original Task Prompt:
${prompt}

Output ONLY valid JSON that strictly matches the expected schema.`;

    try {
      const repairRawText = await execute(repairPrompt);
      const cleaned = repairRawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const repairParsed = JSON.parse(cleaned);
      return schema.parse(repairParsed);
    } catch (repairErr) {
      console.error('[CONCLAIVE] Structured output repair failed:', repairErr.message);
      throw new Error(`Schema validation error: ${repairErr.message}`);
    }
  }
}
