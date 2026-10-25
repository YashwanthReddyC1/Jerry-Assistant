import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JERRY_NO_LISTEN = 'true';
process.env.PORT = '0';
process.env.AI_PROVIDER = 'auto';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.OLLAMA_API_URL = 'http://ollama.test/api/chat';
process.env.GROQ_API_URL = 'http://groq.test/chat';
process.env.WEB_SEARCH_URL = 'https://html.duckduckgo.com/html/';
process.env.ONLINE_AI_BASE_URL = 'http://free-jerry.test';
process.env.AI_REQUEST_TIMEOUT_MS = '1000';
process.env.AI_DAILY_REQUEST_LIMIT = '100';
process.env.LOCAL_FALLBACK = 'false';

console.error = () => {};
let scenario = {};
let upstreamCalls = [];
let ollamaBodies = [];
let hostedChatBody;
const reply = (status, body, cookies = []) => ({ ok: status >= 200 && status < 300, status, headers: { getSetCookie: () => cookies }, text: async () => typeof body === 'string' ? body : JSON.stringify(body), json: async () => body });

globalThis.fetch = async (input, options = {}) => {
  const url = String(input);
  upstreamCalls.push(url);
  if (url.endsWith('/api/tags')) return reply(200, { models: [{ name: 'qwen2.5-coder:7b' }] });
  if (url === process.env.OLLAMA_API_URL) {
    if (scenario.ollamaFails) throw new TypeError('fetch failed');
    ollamaBodies.push(JSON.parse(options.body));
    return reply(200, { message: { content: 'Local reply' } });
  }
  if (url.startsWith(process.env.WEB_SEARCH_URL)) {
    if (scenario.searchFails) return reply(503, { message: 'Search temporarily unavailable' });
    return reply(200, '<div class="result"><a class="result__a" href="https://example.test/live">Example source</a><a class="result__snippet">Verified current detail.</a></div>');
  }
  if (url === `${process.env.ONLINE_AI_BASE_URL}/api/auth/login`) return reply(200, { user: { email: 'user@example.test' } }, ['jerry.sid=free-session; Path=/; HttpOnly']);
  if (url === `${process.env.ONLINE_AI_BASE_URL}/api/chat`) {
    assert.match(options.headers.Cookie, /jerry\.sid=free-session/);
    hostedChatBody = JSON.parse(options.body);
    return reply(200, { response: 'Hosted online answer' });
  }
  if (url === process.env.GROQ_API_URL) {
    if (scenario.groqFails) return reply(503, { error: { message: 'Online provider unavailable' } });
    return reply(200, { choices: [{ message: { content: 'Online reply' } }] });
  }
  throw new Error(`Unexpected upstream request: ${url}`);
};

const { app } = await import('./index.js');
function routeHandler(path) { return app._router.stack.find((layer) => layer.route?.path === path).route.stack[0].handle; }
const chatHandler = routeHandler('/api/chat');
const loginHandler = routeHandler('/api/free-ai/login');

async function chat(message, options = {}) {
  const response = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await chatHandler({ body: { user_id: 'test-user', session_id: `test-${Math.random()}`, message, ...options } }, response);
  return { status: response.statusCode, json: async () => response.body };
}

async function login(userId) {
  const response = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await loginHandler({ body: { user_id: userId, email: 'user@example.test', password: 'test-only-password' } }, response);
  return { status: response.statusCode, json: async () => response.body };
}

test('ordinary requests use Ollama and report Local AI', async () => {
  scenario = {}; upstreamCalls = [];
  const response = await chat('Help me plan a project');
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.route, 'Local AI');
  assert.deepEqual(upstreamCalls, [process.env.OLLAMA_API_URL]);
});

test('live requests search first and report Online AI + Web with sources', async () => {
  scenario = {}; upstreamCalls = [];
  const response = await chat('What is the latest weather today?');
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.route, 'Online AI + Web');
  assert.equal(data.sources[0].url, 'https://example.test/live');
  assert.match(upstreamCalls[0], /^https:\/\/html\.duckduckgo\.com\/html\/\?q=/);
  assert.equal(upstreamCalls[1], process.env.GROQ_API_URL);
});

test('free live route uses the hosted AI with no model API key after sign-in', async () => {
  const groqKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = '';
  process.env.LYZR_API_KEY = '';
  const loginResponse = await login('free-ai-user');
  assert.equal(loginResponse.status, 200);
  scenario = {}; upstreamCalls = []; hostedChatBody = null;
  const response = await chat('What is the latest weather today?', { user_id: 'free-ai-user' });
  const data = await response.json();
  process.env.GROQ_API_KEY = groqKey;
  assert.equal(response.status, 200);
  assert.equal(data.route, 'Online AI + Web');
  assert.equal(data.response, 'Hosted online answer');
  assert.match(hostedChatBody.message, /Verified current detail/);
  assert.deepEqual(upstreamCalls.map((url) => new URL(url).host), ['html.duckduckgo.com', 'free-jerry.test']);
});

test('local-only privacy blocks a live request before any provider call', async () => {
  scenario = {}; upstreamCalls = [];
  const response = await chat('What is the latest news today?', { local_only: true });
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /Local-only privacy is on/);
  assert.deepEqual(upstreamCalls, []);
});

test('failed live search returns an error and never calls the language model', async () => {
  scenario = { searchFails: true }; upstreamCalls = [];
  const response = await chat('What is the latest news today?');
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /Free web search failed \(503\)/);
  assert.equal(upstreamCalls.length, 1);
  assert.match(upstreamCalls[0], /^https:\/\/html\.duckduckgo\.com\/html\/\?q=/);
});

test('ordinary online provider failures can fall back to Ollama', async () => {
  scenario = { groqFails: true }; upstreamCalls = [];
  const response = await chat('Explain photosynthesis', { route: 'online' });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.route, 'Local AI');
  assert.equal(data.fallback, true);
  assert.deepEqual(upstreamCalls, [process.env.GROQ_API_URL, process.env.OLLAMA_API_URL]);
});

test('live provider failures do not fall back to an unverified local answer', async () => {
  scenario = { groqFails: true }; upstreamCalls = [];
  const response = await chat('What is the latest news today?');
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /Online provider unavailable/);
  assert.match(upstreamCalls[0], /^https:\/\/html\.duckduckgo\.com\/html\/\?q=/);
  assert.equal(upstreamCalls[1], process.env.GROQ_API_URL);
});
