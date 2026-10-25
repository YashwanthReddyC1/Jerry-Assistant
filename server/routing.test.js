import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseRoute, classifyRequest, mayFallbackToLocal } from './routing.js';

test('ordinary requests default to local AI without a paid classifier call', () => {
  assert.deepEqual(classifyRequest('Help me organize my notes'), { needsLiveData: false, defaultRoute: 'local' });
  assert.equal(chooseRoute({ message: 'Help me organize my notes' }).route, 'local');
});

test('current facts route to online AI with web search', () => {
  assert.equal(chooseRoute({ message: 'What is the latest weather today?' }).route, 'online_web');
});

test('manual route overrides are honored, with local-only always taking precedence', () => {
  assert.equal(chooseRoute({ message: 'latest news', override: 'online' }).route, 'online');
  assert.equal(chooseRoute({ message: 'explain photosynthesis', override: 'online_web' }).route, 'online_web');
  assert.deepEqual(chooseRoute({ message: 'latest news', override: 'online_web', localOnly: true }), { route: 'local', needsLiveData: true, blockedLiveData: true });
});

test('online failures may fall back for ordinary questions but never for live lookup', () => {
  assert.equal(mayFallbackToLocal({ route: 'online', needsLiveData: false }), true);
  assert.equal(mayFallbackToLocal({ route: 'online', needsLiveData: true }), false);
  assert.equal(mayFallbackToLocal({ route: 'online_web', needsLiveData: false }), false);
});
