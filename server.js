import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { runConclave } from './server/conclaive/orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// In-memory case repository
const caseStore = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'CONCLAIVE Intelligence Environment',
    model: 'gemini-3.8-flash'
  });
});

// SSE Streaming Deliberation Endpoint
app.get('/api/conclave/stream', async (req, res) => {
  const question = (req.query.q || req.query.question || '').toString().trim();
  const context = (req.query.context || '').toString().trim();
  const mode = (req.query.mode || 'STANDARD').toString().toUpperCase();
  const isDemo = req.query.isDemo === 'true';

  if (!question) {
    return res.status(400).json({ error: 'Question is required to convene a Conclave.' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Keep connection alive with heartbeat comments
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  let isClosed = false;
  req.on('close', () => {
    isClosed = true;
    clearInterval(heartbeat);
  });

  const sendEvent = (eventName, data) => {
    if (isClosed) return;
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const finalCase = await runConclave({
      question,
      context,
      mode: mode === 'REDLINE' ? 'REDLINE' : 'STANDARD',
      isDemo,
      onEvent: sendEvent
    });

    caseStore.set(finalCase.caseId, finalCase);
    sendEvent('case.completed', finalCase);
  } catch (err) {
    console.error('[CONCLAIVE SERVER ERROR]', err);
    sendEvent('conclave.interrupted', {
      error: true,
      stage: err.stage || 'deliberation',
      message: err.message || 'An unexpected interruption occurred during the deliberation protocol.'
    });
  } finally {
    clearInterval(heartbeat);
    if (!isClosed) {
      res.end();
    }
  }
});

// Non-streaming fallback endpoint
app.post('/api/conclave/run', async (req, res) => {
  const { question, context, mode, isDemo } = req.body || {};
  const cleanQ = (question || '').trim();

  if (!cleanQ) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const finalCase = await runConclave({
      question: cleanQ,
      context: (context || '').trim(),
      mode: mode === 'REDLINE' ? 'REDLINE' : 'STANDARD',
      isDemo: Boolean(isDemo)
    });
    caseStore.set(finalCase.caseId, finalCase);
    res.json(finalCase);
  } catch (err) {
    console.error('[CONCLAIVE RUN ERROR]', err);
    res.status(500).json({
      error: 'CONCLAVE INTERRUPTED',
      message: err.message || 'Deliberation failed'
    });
  }
});

// Case Retrieval
app.get('/api/conclave/cases/:id', (req, res) => {
  const caseId = req.params.id;
  const conclaveCase = caseStore.get(caseId);
  if (!conclaveCase) {
    return res.status(404).json({ error: 'Case not found in memory store.' });
  }
  res.json(conclaveCase);
});

// Human Decision Gate Recording
app.post('/api/conclave/cases/:id/decide', (req, res) => {
  const caseId = req.params.id;
  const conclaveCase = caseStore.get(caseId);
  if (!conclaveCase) {
    return res.status(404).json({ error: 'Case not found.' });
  }

  const { decision, notes, status = 'DECIDED' } = req.body || {};
  conclaveCase.decisionGate = {
    status,
    humanDecision: decision || 'Decision recorded by human authority.',
    notes: notes || '',
    recordedAt: new Date().toISOString()
  };

  caseStore.set(caseId, conclaveCase);
  res.json(conclaveCase);
});

// Serve frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CONCLAIVE Server running at http://0.0.0.0:${PORT}`);
});
