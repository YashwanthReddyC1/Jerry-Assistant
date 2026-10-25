const LIVE_DATA_PATTERN = /\b(?:today|currently|current|latest|recent|right now|real[ -]?time|live|breaking|this (?:week|month|year)|as of \d{4}|weather|forecast|stock price|share price|exchange rate|news|score|standings|schedule|traffic|status of)\b/i;

export function classifyRequest(message) {
  return { needsLiveData: LIVE_DATA_PATTERN.test(message), defaultRoute: 'local' };
}

export function chooseRoute({ message, override = 'auto', localOnly = false }) {
  const { needsLiveData } = classifyRequest(message);
  if (localOnly) return { route: 'local', needsLiveData, blockedLiveData: needsLiveData };
  if (override === 'local') return { route: 'local', needsLiveData, blockedLiveData: needsLiveData };
  if (override === 'online') return { route: 'online', needsLiveData, blockedLiveData: false };
  if (override === 'online_web') return { route: 'online_web', needsLiveData, blockedLiveData: false };
  return { route: needsLiveData ? 'online_web' : 'local', needsLiveData, blockedLiveData: false };
}

export function mayFallbackToLocal({ needsLiveData, route }) {
  return !needsLiveData && route === 'online';
}
