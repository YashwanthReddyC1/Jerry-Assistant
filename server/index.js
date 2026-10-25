import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { google } from 'googleapis';
import path from 'node:path';
import crypto from 'node:crypto';
import dns from 'node:dns';
import { fileURLToPath } from 'node:url';

dns.setDefaultResultOrder('ipv4first');

const app = express();
const port = Number(process.env.PORT || 8787);
const apiUrl = process.env.LYZR_API_URL || 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
const agentId = process.env.LYZR_AGENT_ID || '6a9e7cce02267ec426e8e216';
const aiProvider = (process.env.AI_PROVIDER || 'groq').toLowerCase();
const groqUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const groqTranscribeUrl = process.env.GROQ_TRANSCRIBE_URL || 'https://api.groq.com/openai/v1/audio/transcriptions';
const configuredGroqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const groqModel = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'].includes(configuredGroqModel) ? 'openai/gpt-oss-20b' : configuredGroqModel;
const groqMaxTokens = Number(process.env.GROQ_MAX_TOKENS || 512);
const groqHistoryLimit = Number(process.env.GROQ_HISTORY_LIMIT || 8);
const groqTranscribeModel = process.env.GROQ_TRANSCRIBE_MODEL || 'whisper-large-v3-turbo';
const localFallbackEnabled = process.env.LOCAL_FALLBACK !== 'false';
const ollamaUrl = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434/api/chat';
const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
let gmailTokens = null;
let gmailState = null;
const groqHistory = new Map();
const ollamaHistory = new Map();

function localFallbackReply(message) {
  const text = message.trim();
  if (/^(hi|hello|hey)\b/i.test(text)) return 'Hi! I’m Jerry, running locally on your computer. Tell me what you need help with.';
  if (/\b(plan|schedule|organize|priorit)\b/i.test(text)) return `Here is a simple way to start:\n\n1. Choose the most important result.\n2. Break it into small actions.\n3. Set a realistic deadline.\n4. Start with the first action now.\n\nWhen Groq is available again, I can turn this into a detailed plan.`;
  return `I received your request: “${text.slice(0, 240)}”\n\nJerry is running locally without an API key. I can help with simple planning and organization here; connect an AI provider later for full generative answers.`;
}

function gmailClient() {
  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/api/gmail/callback`);
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',').map((value) => value.trim()) || true }));
app.use(express.json({ limit: '64kb' }));

app.post('/api/transcribe', express.raw({ type: /^audio\//, limit: '15mb' }), async (req, res) => {
  if (aiProvider !== 'groq' || !process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Voice transcription needs GROQ_API_KEY in your .env file.' });
  if (!req.body?.length) return res.status(400).json({ error: 'No audio was recorded.' });
  try {
    const contentType = req.headers['content-type'] || 'audio/webm';
    const extension = contentType.includes('mp4') ? 'm4a' : contentType.includes('ogg') ? 'ogg' : 'webm';
    const form = new FormData();
    form.append('file', new Blob([req.body], { type: contentType }), `jerry-voice.${extension}`);
    form.append('model', groqTranscribeModel);
    form.append('response_format', 'json');
    const response = await fetch(groqTranscribeUrl, { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
    const raw = await response.text();
    let data; try { data = JSON.parse(raw); } catch { data = {}; }
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || `Groq transcription failed with status ${response.status}.` });
    return res.json({ text: data?.text || '', provider: 'groq', model: groqTranscribeModel });
  } catch (error) {
    console.error('Groq transcription failed:', error);
    return res.status(502).json({ error: 'Jerry could not connect to Groq for voice transcription. Check your internet connection and GROQ_API_KEY, then try again.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, configured: aiProvider === 'groq' ? Boolean(process.env.GROQ_API_KEY) : Boolean(process.env.LYZR_API_KEY), provider: aiProvider, agentId }));

app.get('/api/gmail/status', async (_req, res) => {
  if (!gmailTokens) return res.json({ connected: false });
  try {
    const auth = gmailClient(); auth.setCredentials(gmailTokens);
    const gmail = google.gmail({ version: 'v1', auth });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    res.json({ connected: true, email: profile.data.emailAddress });
  } catch { gmailTokens = null; res.json({ connected: false }); }
});

app.get('/api/gmail/auth', (_req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).send('Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file first.');
  gmailState = crypto.randomUUID();
  const auth = gmailClient();
  res.redirect(auth.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: ['https://www.googleapis.com/auth/gmail.send'], state: gmailState }));
});

app.get('/api/gmail/callback', async (req, res) => {
  if (!req.query.code || req.query.state !== gmailState) return res.status(400).send('Invalid Gmail authorization state.');
  try {
    const auth = gmailClient(); const { tokens } = await auth.getToken(req.query.code); gmailTokens = tokens; gmailState = null;
    res.redirect(`${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}?gmail=connected`);
  } catch { res.status(502).send('Gmail authorization failed.'); }
});

app.post('/api/gmail/send', async (req, res) => {
  const { to, subject, text } = req.body || {};
  if (!gmailTokens) return res.status(401).json({ error: 'Connect Gmail before sending email.' });
  if (!to || !subject || !text) return res.status(400).json({ error: 'to, subject, and text are required.' });
  try {
    const auth = gmailClient(); auth.setCredentials(gmailTokens);
    const gmail = google.gmail({ version: 'v1', auth });
    const raw = [`To: ${to}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset=utf-8', '', text].join('\\r\\n');
    const encoded = Buffer.from(raw).toString('base64url');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
    res.json({ sent: true });
  } catch (error) { console.error('Gmail send failed:', error); res.status(502).json({ error: 'Gmail could not send this message.' }); }
});

app.post('/api/chat', async (req, res) => {
  const { user_id: userId, session_id: sessionId, message } = req.body || {};
  if (!['groq', 'ollama', 'local'].includes(aiProvider) && !process.env.LYZR_API_KEY) return res.status(503).json({ error: 'The assistant is not configured yet. Add LYZR_API_KEY to your environment.' });
  if (!userId || !sessionId || typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'user_id, session_id, and a non-empty message are required.' });
  try {
    if (aiProvider === 'local') return res.json({ response: localFallbackReply(message), provider: 'local' });
    if (aiProvider === 'ollama') {
      const history = ollamaHistory.get(sessionId) || [];
      history.push({ role: 'user', content: message.trim().slice(0, 4000) });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      let ollamaResponse;
      try {
        ollamaResponse = await fetch(ollamaUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ model: ollamaModel, messages: history.slice(-6), stream: false, options: { num_predict: 256, num_ctx: 2048, temperature: 0.5 }, think: false }) });
      } finally { clearTimeout(timeout); }
      const ollamaRaw = await ollamaResponse.text();
      let ollamaData; try { ollamaData = JSON.parse(ollamaRaw); } catch { ollamaData = {}; }
      if (!ollamaResponse.ok) return res.status(ollamaResponse.status).json({ error: ollamaData?.error || `Ollama request failed with status ${ollamaResponse.status}.` });
      const reply = ollamaData?.message?.content;
      if (!reply) return res.status(502).json({ error: 'Ollama returned an empty response. Make sure the Qwen model is installed.' });
      history.push({ role: 'assistant', content: reply });
      ollamaHistory.set(sessionId, history.slice(-8));
      return res.json({ response: reply, provider: 'ollama', model: ollamaModel });
    }
    if (aiProvider === 'groq') {
      if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Jerry is set to Groq, but GROQ_API_KEY is missing from your .env file.' });
      const history = groqHistory.get(sessionId) || [];
      history.push({ role: 'user', content: message.trim().slice(0, 4000) });
      const groqResponse = await fetch(groqUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: JSON.stringify({ model: groqModel, messages: history.slice(-groqHistoryLimit), max_tokens: groqMaxTokens, temperature: 0.5, user: userId }) });
      const groqRaw = await groqResponse.text();
      let groqData; try { groqData = JSON.parse(groqRaw); } catch { groqData = {}; }
      if (!groqResponse.ok) {
        if (localFallbackEnabled && [401, 402, 429, 500, 502, 503].includes(groqResponse.status)) return res.json({ response: localFallbackReply(message), provider: 'local-fallback' });
        return res.status(groqResponse.status).json({ error: groqData?.error?.message || `Groq request failed with status ${groqResponse.status}.` });
      }
      const reply = groqData?.choices?.[0]?.message?.content;
      if (!reply) return res.status(502).json({ error: 'Groq returned an empty response. Please try again.' });
      history.push({ role: 'assistant', content: reply });
      groqHistory.set(sessionId, history.slice(-groqHistoryLimit));
      return res.json({ response: reply, provider: 'groq', model: groqModel });
    }
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.LYZR_API_KEY },
      body: JSON.stringify({ user_id: userId, agent_id: agentId, session_id: sessionId, message: message.trim() })
    };
    let response;
    let lastNetworkError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(apiUrl, request);
        if (response.status < 500 || attempt === 2) break;
      } catch (networkError) {
        lastNetworkError = networkError;
        if (attempt === 2) throw networkError;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
    if (!response && lastNetworkError) throw lastNetworkError;
    const raw = await response.text();
    let data; try { data = JSON.parse(raw); } catch { data = { response: raw }; }
    if (!response.ok) {
      const toolAuthError = data?.error?.type === 'tool_auth' || data?.error?.message === 'Tool authentication required.';
      const errorMessage = toolAuthError
        ? 'Your Jerry agent has an unauthenticated Gmail tool. Connect Gmail in Lyzr Agent Studio, or remove the Gmail tool from the agent.'
        : data?.message || data?.error?.message || data?.error || data?.detail || `Lyzr request failed with status ${response.status}.`;
      return res.status(response.status).json({ error: errorMessage });
    }
    res.json(data);
  } catch (error) {
    const providerName = aiProvider === 'groq' ? 'Groq' : aiProvider === 'ollama' ? 'Ollama' : 'Lyzr';
    console.error(`${providerName} request failed:`, error);
    if (aiProvider === 'groq' && localFallbackEnabled) return res.json({ response: localFallbackReply(message), provider: 'local-fallback' });
    const providerHint = aiProvider === 'groq' ? 'your internet connection and GROQ_API_KEY' : aiProvider === 'ollama' ? 'that Ollama is running with OLLAMA_API_URL and OLLAMA_MODEL' : 'LYZR_API_KEY';
    res.status(502).json({ error: `Jerry could not connect to ${providerName} right now. Check ${providerHint} in your .env file, then try again.` });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, () => console.log(`Jerry server listening on port ${port}`));
