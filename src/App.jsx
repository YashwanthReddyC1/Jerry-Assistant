import { useEffect, useMemo, useRef, useState } from 'react';
import { AlarmClock, Bot, Check, ChevronDown, CircleHelp, Copy, Download, Lightbulb, LogOut, Mail, Menu, MessageCircle, Mic, MicOff, Moon, Paperclip, Pencil, Plus, Search, Send, Share2, Sparkles, Sun, Target, Trash2, User, X } from 'lucide-react';
import './web-search.css';

const starter = [{ role: 'assistant', text: 'Hi, I’m Jerry — your personal AI assistant. What can I help you make happen today?' }];
const suggestions = ['Help me plan my week', 'Draft a professional email', 'Give me a creative idea'];
const quickActions = [
  ['Plan my day', 'Turn my tasks into a realistic schedule.'],
  ['Brainstorm', 'Give me three fresh ideas for a project.'],
  ['Polish writing', 'Improve this text while keeping my tone.']
];
let localTranscriberPromise;

async function getLocalTranscriber(onProgress) {
  if (!localTranscriberPromise) {
    localTranscriberPromise = import('@huggingface/transformers').then(({ pipeline }) =>
      pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny', {
        dtype: 'q8',
        progress_callback: (progress) => {
          if (progress.status === 'progress' && progress.total) {
            onProgress(`Downloading speech model: ${Math.round((progress.loaded / progress.total) * 100)}%`);
          } else if (progress.status === 'done') onProgress('Preparing local speech model…');
        }
      })
    ).catch((error) => { localTranscriberPromise = null; throw error; });
  }
  return localTranscriberPromise;
}

async function transcribeLocally(blob, onProgress) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Audio processing is not supported by this browser.');
  const context = new AudioContextClass();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const samples = decoded.getChannelData(0);
    const targetRate = 16000;
    const outputLength = Math.ceil(samples.length * targetRate / decoded.sampleRate);
    const mono = new Float32Array(outputLength);
    const ratio = decoded.sampleRate / targetRate;
    for (let i = 0; i < outputLength; i += 1) {
      const position = i * ratio;
      const left = Math.floor(position);
      const right = Math.min(left + 1, samples.length - 1);
      mono[i] = samples[left] + (samples[right] - samples[left]) * (position - left);
    }
    onProgress('Transcribing on this device…');
    const transcriber = await getLocalTranscriber(onProgress);
    const result = await transcriber(mono, { sampling_rate: targetRate });
    return result?.text?.trim() || '';
  } finally {
    await context.close();
  }
}

function getWorkTitle(text) {
  const value = (text || '').trim();
  if (!value) return 'New work';
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(value)) return 'Respond to greeting';
  if (/\b(plan|schedule|organize|priorit)/i.test(value)) return 'Plan and organize';
  if (/\b(write|draft|email|message|reply)/i.test(value)) return 'Draft a response';
  if (/\b(explain|learn|what is|how does|help me understand)/i.test(value)) return 'Explain and understand';
  if (/\b(code|website|app|build|debug|fix|program)/i.test(value)) return 'Build and solve';
  return value.slice(0, 42);
}

function getStored(key, fallback) { return localStorage.getItem(key) || fallback; }
function extractText(data) {
  if (typeof data === 'string') return data;
  const value = data?.response || data?.message || data?.answer || data?.content || data?.output || data?.data?.response || data;
  return typeof value === 'string' ? value : JSON.stringify(value);
}
function readableError(value) {
  if (typeof value === 'string') return value;
  if (value?.detail) return readableError(value.detail);
  if (value?.message) return readableError(value.message);
  try { return JSON.stringify(value); } catch { return 'The assistant returned an unreadable error.'; }
}
async function readResponse(response) {
  const raw = await response.text();
  if (!raw.trim()) return { error: `Server returned an empty response (${response.status}).` };
  try { return JSON.parse(raw); } catch { return { error: raw.slice(0, 300) || `Server returned an invalid response (${response.status}).` }; }
}

export default function App() {
  const [messages, setMessages] = useState(() => { try { return JSON.parse(localStorage.getItem('jerry_messages')) || starter; } catch { return starter; } });
  const [authRequired, setAuthRequired] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [workspace, setWorkspace] = useState('Personal assistant');
  const [activeView, setActiveView] = useState('assistant');
  const [appMode, setAppMode] = useState('chat');
  const [workPanel, setWorkPanel] = useState('');
  const [selectedProject, setSelectedProject] = useState('No project');
  const [selectedPlugins, setSelectedPlugins] = useState([]);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [approvalMode, setApprovalMode] = useState('ask');
  const [approvalInfoOpen, setApprovalInfoOpen] = useState(false);
  const [conversationSettingsOpen, setConversationSettingsOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [workEffort, setWorkEffort] = useState(50);
  const [workEffortLevel, setWorkEffortLevel] = useState('medium');
  const [assistantMode, setAssistantMode] = useState('chat');
  const [scheduleCreateOpen, setScheduleCreateOpen] = useState(false);
  const [scheduleManualOpen, setScheduleManualOpen] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('jerry_theme') || 'light');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [planMode, setPlanMode] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem('jerry_notes')) || []; } catch { return []; } });
  const [noteDraft, setNoteDraft] = useState('');
  const [gmail, setGmail] = useState({ connected: false, email: '' });
  const [emailDraft, setEmailDraft] = useState({ to: '', subject: '', text: '' });
  const [emailStatus, setEmailStatus] = useState('');
  const [focusItems, setFocusItems] = useState(() => { try { return JSON.parse(localStorage.getItem('jerry_focus')) || []; } catch { return []; } });
  const [focusDraft, setFocusDraft] = useState('');
  const [editingFocusId, setEditingFocusId] = useState(null);
  const userId = useMemo(() => getStored('jerry_user_id', `user-${crypto.randomUUID()}`), []);
  const sessionId = useMemo(() => getStored('jerry_session_id', `session-${crypto.randomUUID()}`), []);
  const endRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);


  useEffect(() => { localStorage.setItem('jerry_user_id', userId); localStorage.setItem('jerry_session_id', sessionId); }, [userId, sessionId]);
  useEffect(() => { localStorage.setItem('jerry_messages', JSON.stringify(messages)); endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    if (!authRequired || !authUser) return;
    const previousEmail = localStorage.getItem('jerry_auth_email');
    if (previousEmail !== authUser.email) {
      for (const key of ['jerry_messages', 'jerry_notes', 'jerry_focus', 'jerry_user_id', 'jerry_session_id']) localStorage.removeItem(key);
      setMessages(starter); setNotes([]); setFocusItems([]);
      localStorage.setItem('jerry_auth_email', authUser.email);
    }
  }, [authRequired, authUser]);

  useEffect(() => { localStorage.setItem('jerry_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('jerry_focus', JSON.stringify(focusItems)); }, [focusItems]);
  useEffect(() => { localStorage.setItem('jerry_theme', theme); }, [theme]);
  useEffect(() => {
    let active = true;
    fetch('/api/auth/status').then((response) => response.json()).then(async (status) => {
      if (!active) return;
      setAuthRequired(Boolean(status.required));
      if (status.required) {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (active && response.ok) setAuthUser(data.user);
      }
    }).catch(() => {}).finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (authLoading || (authRequired && !authUser)) return;
    fetch('/api/gmail/status').then((response) => response.json()).then(setGmail).catch(() => {});
  }, [authLoading, authRequired, authUser]);
  function newChat() { setMessages(starter); setError(''); setInput(''); setWorkspace('Personal assistant'); setActiveView('assistant'); setMenuOpen(false); setProfileOpen(false); localStorage.removeItem('jerry_messages'); }
  async function toggleVoice() {
    setVoiceError('');
    if (listening) {
      recorderRef.current?.stop();
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Microphone recording is not supported here. Open Jerry in a secure browser page, such as localhost, and try again.');
      setVoiceStatus('Requesting microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => setVoiceError('Microphone recording failed. Check microphone access and try again.');
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setListening(false);
        if (!chunks.length) { setVoiceStatus(''); setVoiceError('No audio was recorded. Try again and speak after tapping Talk.'); return; }
        try {
          const transcript = await transcribeLocally(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }), setVoiceStatus);
          if (!transcript) throw new Error('No speech was detected. Try again and speak clearly.');
          setInput((current) => current ? `${current}${/\s$/.test(current) ? '' : ' '}${transcript}` : transcript);
          setVoiceStatus('Speech added to your message.');
          window.setTimeout(() => setVoiceStatus(''), 1800);
        } catch (error) {
          setVoiceStatus('');
          setVoiceError(error?.message || 'Local transcription failed. Please try again.');
        }
      };
      recorder.start();
      setListening(true);
      setVoiceStatus('Listening… speak now. Tap Stop when finished.');
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setListening(false);
      setVoiceStatus('');
      setVoiceError(error?.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it in your browser settings, then try again.' : error?.message || 'Microphone could not start. Allow microphone access, then try again.');
    }
  }
  function selectMode() {
    setAppMode('chat');
    selectWorkspace('Personal assistant');
  }
  function selectWorkspace(name) {
    if (name === 'Scheduled tasks') setAppMode('work');
    if (name === 'Personal assistant') setAppMode('chat');
    setWorkspace(name);
    setMenuOpen(false);
    setActiveView(name === 'Ideas & notes' ? 'ideas' : name === 'Daily focus' ? 'focus' : name === 'Scheduled tasks' ? 'schedule' : 'assistant');
  }
  function addNote(event) { event.preventDefault(); const text = noteDraft.trim(); if (!text) return; setNotes((current) => [{ id: crypto.randomUUID(), text, createdAt: new Date().toLocaleDateString() }, ...current]); setNoteDraft(''); }
  function saveFocus(event) { event.preventDefault(); const text = focusDraft.trim(); if (!text) return; setFocusItems((current) => editingFocusId ? current.map((item) => item.id === editingFocusId ? { ...item, text } : item) : [...current, { id: crypto.randomUUID(), text }]); setFocusDraft(''); setEditingFocusId(null); }
  function handleFiles(event) { const files = Array.from(event.target.files || []); if (!files.length) return; setAttachments((current) => [...current, ...files].slice(0, 5)); setAddMenuOpen(false); event.target.value = ''; }
  function removeAttachment(index) { setAttachments((current) => current.filter((_file, fileIndex) => fileIndex !== index)); }
  async function sendEmail(event) { event.preventDefault(); setEmailStatus('Sending…'); const response = await fetch('/api/gmail/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emailDraft) }); const data = await readResponse(response); setEmailStatus(response.ok ? 'Email sent successfully.' : data.error || 'Email could not be sent.'); if (response.ok) setEmailDraft({ to: '', subject: '', text: '' }); }
  async function signOut() {
    for (const key of ['jerry_messages', 'jerry_notes', 'jerry_focus', 'jerry_user_id', 'jerry_session_id', 'jerry_auth_email']) localStorage.removeItem(key);
    try { await fetch('/api/auth/logout', { method: 'POST' }); } finally { window.location.assign('/'); }
  }
  async function submitAuth(event) {
    event.preventDefault();
    setAuthMessage('');
    if (authMode === 'signup' && authForm.password !== authForm.confirmPassword) { setAuthMessage('The passwords do not match.'); return; }
    setAuthBusy(true);
    try {
      const response = await fetch(`/api/auth/${authMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password }) });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(data.error || 'Jerry could not sign you in.');
      if (data.confirmationRequired) {
        setAuthMessage(data.message || 'Check your email for a verification link, then sign in to Jerry.');
        setAuthMode('login');
      } else setAuthUser(data.user);
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) { setAuthMessage(error.message || 'Jerry could not sign you in.'); }
    finally { setAuthBusy(false); }
  }
  const displayedFocus = focusItems.length ? focusItems : messages.filter((message) => message.role === 'user').slice(-6).reverse().map((message, index) => ({ id: `message-${index}`, text: message.text }));
  async function sendMessage(event) {
    event?.preventDefault();
    const selectedFiles = attachments;
    if (selectedFiles.filter((file) => file.type.startsWith('image/')).reduce((total, file) => total + file.size, 0) > 8 * 1024 * 1024) { setError('Photos together must be under 8 MB. Remove a photo and try again.'); return; }
    const message = input.trim() || (selectedFiles.length ? 'Please review the attached file(s).' : '');
    if (!message || loading) return;
    const attemptId = crypto.randomUUID();
    setInput(''); setError(''); setMessages((current) => [...current, { id: attemptId, role: 'user', text: message, attachments: selectedFiles.map((file) => file.name) }]); setLoading(true);
    try {
      const workContext = activeView === 'work'
        ? `\n\nYou are responding in Jerry Work. Act on the user's request directly, preserve their intent, and provide a practical result or clear next steps. Do not redirect them to Chat.`
        : '';
      const requestMessage = assistantMode === 'code' ? `${message}\n\nYou are in Code mode. Give a precise technical answer, include useful code when appropriate, and explain the key implementation steps.${workContext}` : planMode ? `${message}\n\nPlease answer in plan mode: organize this into clear steps, assumptions, priorities, and a practical next action.${workContext}` : `${message}${workContext}`;
      const serializedAttachments = await Promise.all(selectedFiles.map(async (file) => {
        if (file.type.startsWith('image/')) {
          if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} is larger than 5 MB. Choose a smaller photo.`);
          const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error(`Could not read ${file.name}.`)); reader.readAsDataURL(file); });
          return { name: file.name, type: file.type, size: file.size, image: String(dataUrl).split(',')[1] };
        }
        if (/\.(txt|md|csv|json|log)$/i.test(file.name) || file.type.startsWith('text/')) {
          if (file.size > 25 * 1024 * 1024) throw new Error(`${file.name} is larger than 25 MB. Choose a smaller text or CSV file.`);
          return { name: file.name, type: file.type, size: file.size, text: await file.slice(0, 12000).text(), truncated: file.size > 12000 };
        }
        throw new Error(`${file.name} cannot be read yet. Jerry supports photos and text, CSV, JSON, and Markdown files.`);
      }));
      const requestOptions = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, session_id: sessionId, message: requestMessage, mode: activeView === 'work' ? 'work' : 'chat', search_query: message, attachments: serializedAttachments }) };
      const response = await fetch('/api/chat', requestOptions);
      const data = await readResponse(response);
      if (!response.ok) throw new Error(readableError(data.error || data.detail || data.message || 'Something went wrong.'));
      const reply = extractText(data);
      setMessages((current) => [...current, { role: 'assistant', text: reply, route: data.route || (data.sources?.length ? 'Local AI + Web' : 'Local AI'), sources: Array.isArray(data.sources) ? data.sources : [] }]);
      setAttachments([]);
    } catch (requestError) { setError(requestError.message); setMessages((current) => current.filter((item) => item.id !== attemptId)); if (activeView === 'work') setMessages((current) => [...current, { role: 'assistant', text: `I couldn't complete that Work request yet. ${requestError.message}` }]); }
    finally { setLoading(false); }
  }
  async function copyMessage(text, index) { await navigator.clipboard?.writeText(text); setCopied(index); setTimeout(() => setCopied(null), 1400); }
  function conversationText() { return messages.map((message) => `${message.role === 'assistant' ? 'Jerry' : 'You'}: ${message.text}`).join('\n\n'); }
  async function copyConversation() { await navigator.clipboard?.writeText(conversationText()); setShareMenuOpen(false); setShareNotice('Conversation copied.'); setTimeout(() => setShareNotice(''), 1800); }
  function downloadConversation() { const blob = new Blob([conversationText()], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'jerry-conversation.txt'; link.click(); URL.revokeObjectURL(url); setShareMenuOpen(false); setShareNotice('Conversation downloaded.'); setTimeout(() => setShareNotice(''), 1800); }
  async function shareConversation() { const transcript = conversationText(); try { if (navigator.share) await navigator.share({ title: 'Jerry conversation', text: transcript }); else await navigator.clipboard?.writeText(transcript); setShareMenuOpen(false); setShareNotice(navigator.share ? 'Conversation shared.' : 'Conversation copied.'); setTimeout(() => setShareNotice(''), 1800); } catch { setShareMenuOpen(false); setShareNotice('Sharing cancelled.'); setTimeout(() => setShareNotice(''), 1800); } }

  if (authLoading) return <main className="auth-screen"><p>Loading Jerry…</p></main>;
  if (authRequired && !authUser) return <main className="auth-screen"><div className="auth-card"><div className="auth-mark"><Sparkles size={22} /></div><p className="eyebrow">PERSONAL AI ASSISTANT</p><h1>{authMode === 'login' ? 'Welcome to Jerry' : 'Create your Jerry account'}</h1><p>{authMode === 'login' ? 'Sign in to open your personal workspace.' : 'Create an account to start using Jerry.'}</p><form className="auth-form" onSubmit={submitAuth}>{authMode === 'signup' && <label>Your name<input autoComplete="name" maxLength={80} value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Name" /></label>}<label>Email<input required type="email" autoComplete="email" maxLength={254} value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" /></label><label>Password<input required type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={authMode === 'signup' ? 12 : 1} value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder={authMode === 'signup' ? 'At least 12 characters' : 'Your password'} /></label>{authMode === 'signup' && <label>Confirm password<input required type="password" autoComplete="new-password" minLength={12} value={authForm.confirmPassword} onChange={(event) => setAuthForm({ ...authForm, confirmPassword: event.target.value })} placeholder="Enter your password again" /></label>}{authMessage && <div className="auth-error" role="alert">{authMessage}</div>}<button className="google-sign-in" type="submit" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button></form><button type="button" className="auth-switch" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage(''); }}>{authMode === 'login' ? 'New to Jerry? Create an account' : 'Already have an account? Sign in'}</button><p className="auth-footnote">Jerry uses Supabase Auth to protect your account. Jerry does not store your password.</p></div></main>;

  return <div className={`app-shell ${theme === 'dark' ? 'dark-mode' : ''} ${activeView === 'work' ? 'work-mode' : ''}`}>
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>Jerry</span><button type="button" className="mobile-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <button type="button" className="new-chat" onClick={newChat}><Plus size={18} /> New conversation</button>
      <div className="side-label">Workspace</div>
      <button type="button" className={`side-link ${workspace === 'Personal assistant' ? 'active' : ''}`} onClick={() => selectWorkspace('Personal assistant')}><Bot size={17} /> Personal assistant</button>
      <button type="button" className={`side-link ${workspace === 'Ideas & notes' ? 'active' : ''}`} onClick={() => selectWorkspace('Ideas & notes')}><Lightbulb size={17} /> Ideas & notes</button>
      <button type="button" className={`side-link ${workspace === 'Daily focus' ? 'active' : ''}`} onClick={() => selectWorkspace('Daily focus')}><Check size={17} /> Daily focus</button>
      <button type="button" className={`side-link ${workspace === 'Scheduled tasks' ? 'active' : ''}`} onClick={() => selectWorkspace('Scheduled tasks')}><AlarmClock size={17} /> Scheduled tasks</button>
      <div className="sidebar-bottom"><div className="tip"><CircleHelp size={16} /><span>Chat messages use local Ollama. Conversations stay in this browser.</span></div><button type="button" className="profile" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)} style={{width:'100%',borderLeft:0,borderRight:0,borderBottom:0,textAlign:'left',cursor:'pointer',background:'transparent',color:'inherit'}}><div className="avatar small">J</div><div><strong>{authUser?.name || 'Your workspace'}</strong><span>{authUser?.email || 'Personal plan'}</span></div><ChevronDown size={16} style={{transform:profileOpen ? 'rotate(180deg)' : 'none',transition:'transform .2s'}} /></button>{profileOpen && <div style={{margin:'10px 6px 0',padding:'12px',borderRadius:'10px',background:'#ffffff1c',border:'1px solid #ffffff2b',color:'#d9efff',fontSize:'11px',lineHeight:1.5}}>Jerry is connected to your personal workspace.<br /><span style={{color:'#a9d9f5'}}>Your conversations stay in this browser.</span>{authUser && <button type='button' className='sign-out-button' onClick={signOut}><LogOut size={15} /><span>Sign out</span></button>}</div>}</div>
    </aside>
    {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
    <main className="main">
      <header className="topbar"><button type="button" className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="top-title"><span className="status-dot" /> {activeView === 'assistant' ? 'Jerry' : activeView === 'ideas' ? 'Ideas & notes' : activeView === 'focus' ? 'Daily focus' : activeView === 'work' ? 'Work' : activeView === 'schedule' ? 'Scheduled tasks' : 'Gmail'} <span className="online">Online</span></div><div className="mode-switch" role="tablist" aria-label="Choose workspace mode"><button type="button" className={appMode === 'chat' ? 'active' : ''} role="tab" aria-selected={appMode === 'chat'} onClick={() => selectMode('chat')}>Chat</button><button type="button" className={appMode === 'work' ? 'active' : ''} role="tab" aria-selected={appMode === 'work'} onClick={() => selectMode('work')}>Work</button></div><div className="top-actions"><button type="button" className="icon-action" aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title={theme === 'dark' ? 'Light theme' : 'Dark theme'} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button><button type="button" className="top-action" aria-label="Start new chat" onClick={newChat}><Plus size={17} /> <span>New chat</span></button></div></header>
      <section className="chat-area" style={{display:activeView === 'assistant' ? 'block' : 'none'}}><div className="conversation"><div className="conversation-toolbar"><strong>{messages.length > 1 ? getWorkTitle(messages.find((message) => message.role === 'user')?.text) : 'New conversation'}</strong><button type="button" className="conversation-share" title="Share this conversation" aria-expanded={shareMenuOpen} onClick={() => { setConversationSettingsOpen(false); setShareMenuOpen((open) => !open); }}><Share2 size={15} /> Share</button><button type="button" aria-label="Conversation settings" aria-expanded={conversationSettingsOpen} onClick={() => { setShareMenuOpen(false); setConversationSettingsOpen((open) => !open); }}><Menu size={17} /></button></div>{shareMenuOpen && <div className="share-menu"><strong>Share conversation</strong><button type="button" onClick={copyConversation}><Copy size={15} /> <span>Copy conversation</span></button><button type="button" onClick={downloadConversation}><Download size={15} /> <span>Download as text</span></button>{navigator.share && <button type="button" onClick={shareConversation}><Share2 size={15} /> <span>Use device share</span></button>}</div>}{conversationSettingsOpen && <div className="conversation-settings"><strong>Conversation settings</strong><p>Manage this chat on this device.</p><button type="button" className="clear-conversation" onClick={() => { setMessages(starter); setConversationSettingsOpen(false); localStorage.removeItem('jerry_messages'); }}><Trash2 size={15} /><span>Clear conversation</span></button></div>}{shareNotice && <div className="share-notice">{shareNotice}</div>}
        <div className="welcome"><div className="welcome-icon"><Sparkles size={25} /></div><div><p className="eyebrow">PERSONAL AI ASSISTANT</p><h1>How can I help<br /><em>you today?</em></h1><p className="subcopy">A calm space to think through ideas, solve problems, and turn plans into progress.</p></div></div>
        {messages.length === 1 && <div className="quick-actions">{quickActions.map(([label, prompt]) => <button type="button" key={label} onClick={() => setInput(prompt)}><span>{label}</span><small>{prompt}</small><b>→</b></button>)}</div>}
        <div className="insight-strip"><div><small>Today</small><strong>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong><span>Your workspace</span></div><div><small>Conversation</small><strong>{Math.max(0, messages.length - 1)}</strong><span>messages</span></div><div><small>Saved ideas</small><strong>{notes.length}</strong><span>in your notebook</span></div></div>
        <div className="messages">{messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${index}-${message.text.slice(0, 8)}`}><div className="avatar">{message.role === 'assistant' ? <Sparkles size={16} /> : <User size={16} />}</div><div className="message-content"><div className="message-name">{message.role === 'assistant' ? 'Jerry' : 'You'} <span>{message.role === 'assistant' ? '· AI assistant' : ''}</span></div><div className="bubble">{message.text}{message.attachments?.length > 0 && <div style={{marginTop:8,fontSize:12,color:'#50708c'}}>Attached: {message.attachments.join(', ')}</div>}</div>{message.role === 'assistant' && message.route && <div className="route-label">{message.route}</div>}{message.sources?.length > 0 && <div className="web-sources"><strong>Web sources</strong>{message.sources.map((source, sourceIndex) => <a key={`${source.url}-${sourceIndex}`} href={source.url} target="_blank" rel="noreferrer">[{sourceIndex + 1}] {source.title}</a>)}</div>}{message.role === 'assistant' && <button className="copy" onClick={() => copyMessage(message.text, index)}>{copied === index ? <Check size={13} /> : <Copy size={13} />} {copied === index ? 'Copied' : 'Copy'}</button>}</div></div>)}{loading && <div className="message-row assistant"><div className="avatar"><Sparkles size={16} /></div><div className="message-content"><div className="message-name">Jerry <span>· AI assistant</span></div><div className="bubble typing"><i /><i /><i /></div></div></div>}<div ref={endRef} /></div>
        {messages.length === 1 && <div className="suggestions"><span>Try asking</span>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}</button>)}</div>}
      </div></section>
      {activeView === 'work' && <section className="work-view"><div className="work-center"><div className="work-thread-header"><strong>{getWorkTitle(input || messages.find((message) => message.role === 'user')?.text)}</strong><span>•••</span><div><button type="button" className="conversation-share" title="Share this conversation" aria-expanded={shareMenuOpen} onClick={() => { setConversationSettingsOpen(false); setShareMenuOpen((open) => !open); }}><Share2 size={15} /> Share</button><button type="button" aria-label="Conversation settings" aria-expanded={conversationSettingsOpen} onClick={() => { setShareMenuOpen(false); setConversationSettingsOpen((open) => !open); }}><Menu size={17} /></button></div></div>{shareMenuOpen && <div className="share-menu work-share-menu"><strong>Share conversation</strong><button type="button" onClick={copyConversation}><Copy size={15} /> <span>Copy conversation</span></button><button type="button" onClick={downloadConversation}><Download size={15} /> <span>Download as text</span></button>{navigator.share && <button type="button" onClick={shareConversation}><Share2 size={15} /> <span>Use device share</span></button>}</div>}{conversationSettingsOpen && <div className="conversation-settings work-settings"><strong>Conversation settings</strong><p>Manage this chat on this device.</p><button type="button" className="clear-conversation" onClick={() => { setMessages(starter); setConversationSettingsOpen(false); localStorage.removeItem('jerry_messages'); }}><Trash2 size={15} /><span>Clear conversation</span></button></div>}{shareNotice && <div className="share-notice">{shareNotice}</div>}<div className="work-plus">✦ <span>Jerry Work</span></div><h1>What should we work on?</h1><form className="work-composer" onSubmit={(event) => { event.preventDefault(); if (!input.trim()) return; sendMessage(event); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Work with Jerry" rows="2" />{attachments.length > 0 && <div className="work-attachments">{attachments.map((file,index) => <div className="work-attachment" key={`${file.name}-${index}`}>{file.type.startsWith('image/') ? <img src={URL.createObjectURL(file)} alt="" /> : <Paperclip size={16} />}<span>{file.name}</span><button type="button" onClick={() => removeAttachment(index)} aria-label={`Remove ${file.name}`}>×</button></div>)}</div>}<div className="work-composer-bottom"><button type="button" className="work-icon-button" aria-label="Add work files" onClick={() => fileInputRef.current?.click()}><Plus size={21} /></button><button type="button" className={`approval-button ${approvalMode !== 'ask' ? 'enabled' : ''}`} onClick={() => setWorkPanel(workPanel === 'approval' ? '' : 'approval')}><Check size={15} /> {approvalMode === 'ask' ? 'Ask for approval' : approvalMode === 'approve' ? 'Approve for me' : 'Full access'}</button>{workPanel === 'approval' && <div className="work-panel approval-panel inline-approval"><div className="approval-heading">How should Jerry actions be approved?<button type="button" className="approval-learn" onClick={() => setApprovalInfoOpen(true)}>Learn more</button></div><button type="button" className={approvalMode === 'ask' ? 'selected' : ''} onClick={() => { setApprovalMode('ask'); setApprovalRequired(true); setWorkPanel(''); }}><Check size={16} /><span><strong>Ask for approval</strong><small>Always ask to edit external files and use the internet</small></span></button><button type="button" className={approvalMode === 'approve' ? 'selected' : ''} onClick={() => { setApprovalMode('approve'); setApprovalRequired(false); setWorkPanel(''); }}><Check size={16} /><span><strong>Approve for me</strong><small>Only ask for actions detected as potentially unsafe</small></span></button><button type="button" className={approvalMode === 'full' ? 'selected full' : 'full'} onClick={() => { setApprovalMode('full'); setApprovalRequired(false); setWorkPanel(''); }}><Check size={16} /><span><strong>Full access</strong><small>Unrestricted access to the internet and any file on your computer</small></span></button></div>}<span className="work-spacer" /><button type="button" className="model-button" onClick={() => setModelOpen((open) => !open)}>{modelOpen ? 'Select effort' : 'Jerry'} <small>{modelOpen ? '' : 'Medium'}</small><ChevronDown size={15} /></button><button type="button" className="work-mic" onClick={toggleVoice} aria-label="Use microphone"><Mic size={18} /></button><button className="work-send" aria-label="Start work" disabled={!input.trim()}><Send size={18} /></button></div></form><div className="work-tools"><button type="button" onClick={() => setWorkPanel(workPanel === 'projects' ? '' : 'projects')}>▢ &nbsp; Choose project</button><button type="button" onClick={() => setWorkPanel(workPanel === 'plugins' ? '' : 'plugins')}>◉ &nbsp; Plugins</button></div><div className="work-panels">{workPanel === 'approval' && <div className="work-panel approval-panel"><div className="approval-heading">How should Jerry actions be approved?<button type="button" className="approval-learn" onClick={() => setApprovalInfoOpen(true)}>Learn more</button></div><button type="button" className={approvalMode === 'ask' ? 'selected' : ''} onClick={() => { setApprovalMode('ask'); setApprovalRequired(true); setWorkPanel(''); }}><Check size={16} /><span><strong>Ask for approval</strong><small>Always ask to edit external files and use the internet</small></span></button><button type="button" className={approvalMode === 'approve' ? 'selected' : ''} onClick={() => { setApprovalMode('approve'); setApprovalRequired(false); setWorkPanel(''); }}><Check size={16} /><span><strong>Approve for me</strong><small>Only ask for actions detected as potentially unsafe</small></span></button><button type="button" className={approvalMode === 'full' ? 'selected full' : 'full'} onClick={() => { setApprovalMode('full'); setApprovalRequired(false); setWorkPanel(''); }}><Check size={16} /><span><strong>Full access</strong><small>Unrestricted access to the internet and any file on your computer</small></span></button></div>}{workPanel === 'files' && <div className="work-panel"><strong>Files added</strong><span>Your selected files are attached to this work session.</span><button type="button" onClick={() => setWorkPanel('')}>Done</button></div>}{workPanel === 'projects' && <div className="work-panel"><strong>Choose project</strong><div className="panel-options">{['Personal workspace','Website redesign','Research notes'].map((project) => <button type="button" className={selectedProject === project ? 'selected' : ''} key={project} onClick={() => { setSelectedProject(project); setWorkPanel(''); }}>{project}</button>)}</div></div>}{workPanel === 'plugins' && <div className="work-panel"><strong>Add plugins</strong><span>Select tools Jerry can use for this work.</span><div className="panel-options">{['Gmail','GitHub','Documents'].map((plugin) => <button type="button" className={selectedPlugins.includes(plugin) ? 'selected' : ''} key={plugin} onClick={() => setSelectedPlugins((current) => current.includes(plugin) ? current.filter((item) => item !== plugin) : [...current, plugin])}>{selectedPlugins.includes(plugin) ? '✓ ' : ''}{plugin}</button>)}</div><button type="button" onClick={() => setWorkPanel('')}>Done</button></div>}{modelOpen && <div className="work-panel model-panel"><div className="model-menu-top"><div><strong>{workEffortLevel[0].toUpperCase() + workEffortLevel.slice(1)}</strong><span>Jerry</span></div><button type="button" onClick={() => { setWorkEffort(50); setWorkEffortLevel('medium'); }} aria-label="Reset effort">↻</button></div><div className="effort-dots"><input className="effort-dots-slider" type="range" min="0" max="100" value={workEffort} onChange={(event) => { const value = Number(event.target.value); setWorkEffort(value); setWorkEffortLevel(value < 25 ? 'easy' : value < 50 ? 'medium' : value < 75 ? 'high' : 'max'); }} /><div className="effort-dot-markers">{[0,1,2,3].map((index) => <i key={index} />)}</div></div><div className="effort-labels"><span>Easy</span><span>Medium</span><span>High</span><span>Max</span></div><div className="model-menu-bottom"><button type="button" onClick={() => setModelOpen(false)}>Select effort <ChevronDown size={14} /></button><Mic size={16} /></div></div>}{approvalInfoOpen && <div className="approval-info"><div className="approval-info-head"><strong>How Jerry actions work</strong><button type="button" onClick={() => setApprovalInfoOpen(false)} aria-label="Close information"><X size={15} /></button></div><p>Jerry can help with your files, connected tools, and online services. Approval settings decide when Jerry pauses and asks before taking an action.</p><h4>What the workspace boundary does</h4><p>Jerry works within the files and tools you choose for this session. Actions inside that boundary can continue smoothly; actions outside it should wait for your permission.</p><h4>Choose the level that fits</h4><ul><li><strong>Ask for approval:</strong> Jerry pauses before actions that may affect external files or use the internet.</li><li><strong>Approve for me:</strong> Jerry continues with routine actions and asks only when something looks potentially unsafe.</li><li><strong>Full access:</strong> Jerry can use connected tools and files without pausing. Use this only when you trust the task and understand its scope.</li></ul><p className="approval-note">You can change this choice at any time from the approval menu.</p></div>}</div><div className="work-responses">{messages.filter((message) => message.role !== 'assistant' || message.text !== starter[0].text).map((message, index) => <div className={`work-response ${message.role}`} key={`work-${index}-${message.text.slice(0, 8)}`}><strong>{message.role === 'assistant' ? 'Jerry' : 'You'}</strong><p>{message.text}</p></div>)}{loading && <div className="work-response assistant"><strong>Jerry</strong><p className="work-thinking">Jerry is thinking…</p></div>}</div></div></section>}
      {activeView === 'ideas' && <section className="chat-area"><div className="conversation"><div className="welcome"><div className="welcome-icon"><Lightbulb size={25} /></div><div><p className="eyebrow">YOUR IDEAS</p><h1>Capture your<br /><em>best thinking.</em></h1><p className="subcopy">Keep quick notes here and return to them whenever inspiration strikes.</p></div></div><form onSubmit={addNote} style={{display:'flex',gap:10,marginBottom:24}}><input value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Write a new idea..." style={{flex:1,border:'1px solid #cfe1f3',borderRadius:12,padding:'13px 15px',font:'inherit',color:'#27486c',outline:0}} /><button className="send" aria-label="Save idea"><Plus size={18} /></button></form><div style={{display:'grid',gap:12}}>{notes.length ? notes.map((note) => <article key={note.id} style={{background:'#fff',border:'1px solid #dceafa',borderRadius:14,padding:'15px 17px',boxShadow:'0 8px 24px #27629812'}}><div style={{fontSize:14,lineHeight:1.6,color:'#304f70'}}>{note.text}</div><small style={{display:'block',marginTop:8,color:'#7d98b3'}}>{note.createdAt}</small></article>) : <div style={{background:'#ffffffb8',border:'1px dashed #b8d2e8',borderRadius:14,padding:24,color:'#7894af',textAlign:'center'}}>Your saved ideas will appear here.</div>}</div></div></section>}
      {activeView === 'focus' && <section className="chat-area"><div className="conversation"><div className="welcome"><div className="welcome-icon"><Check size={25} /></div><div><p className="eyebrow">DAILY FOCUS · {new Date().toLocaleDateString()}</p><h1>Make today<br /><em>count.</em></h1><p className="subcopy">Build a focus list from your work, then edit it whenever your priorities change.</p></div></div><form onSubmit={saveFocus} style={{display:'flex',gap:10,marginBottom:24}}><input value={focusDraft} onChange={(event) => setFocusDraft(event.target.value)} placeholder={editingFocusId ? 'Update this focus item...' : 'Add a focus item...'} style={{flex:1,border:'1px solid #cfe1f3',borderRadius:12,padding:'13px 15px',font:'inherit',color:'#27486c',outline:0}} /><button className="send" aria-label={editingFocusId ? 'Save focus edit' : 'Add focus item'}><Plus size={18} /></button></form><div style={{display:'grid',gap:12}}>{displayedFocus.map((item, index) => <article key={item.id} style={{display:'flex',gap:13,alignItems:'center',background:'#fff',border:'1px solid #dceafa',borderRadius:14,padding:'13px 14px 13px 17px',boxShadow:'0 8px 24px #27629812'}}><div style={{width:26,height:26,borderRadius:9,background:'#e3f1ff',color:'#2471b0',display:'grid',placeItems:'center',fontSize:12,fontWeight:700}}>{index + 1}</div><div style={{flex:1,fontSize:14,lineHeight:1.6,color:'#304f70'}}>{item.text}</div><button type="button" className="copy" aria-label={`Edit focus item ${index + 1}`} onClick={() => { setFocusDraft(item.text); setEditingFocusId(item.id); }}><Pencil size={14} /> Edit</button></article>)}{!displayedFocus.length && <div style={{background:'#ffffffb8',border:'1px dashed #b8d2e8',borderRadius:14,padding:24,color:'#7894af',textAlign:'center'}}>Add your first focus item above.</div>}</div><button type="button" className="top-action" onClick={() => selectWorkspace('Personal assistant')} style={{marginTop:24}}>← Back to Jerry</button></div></section>}
      {activeView === 'schedule' && <section className="chat-area schedule-view"><div className="schedule-page"><div className="schedule-heading"><div><p className="eyebrow">JERRY WORKSPACE</p><h1>Scheduled tasks</h1><p className="schedule-subtitle">Ask Jerry to schedule tasks, set reminders, or monitor for updates</p></div><div className="schedule-create"><div className="create-control"><button type="button" className="create-button create-button-main" onClick={() => { setInput('Help me create a scheduled task.'); selectWorkspace('Personal assistant'); }}>Create</button><button type="button" className="create-button create-button-arrow" aria-label="Show create options" onClick={() => setScheduleCreateOpen((open) => !open)}><ChevronDown size={16} /></button></div>{scheduleCreateOpen && <div className="create-menu"><button type="button" onClick={() => { setScheduleCreateOpen(false); setInput('Help me create a scheduled task.'); selectWorkspace('Personal assistant'); }}><MessageCircle size={16} /> Create with Jerry</button><button type="button" onClick={() => { setScheduleCreateOpen(false); setScheduleManualOpen(true); }}><Pencil size={16} /> Set up manually</button></div>}</div></div><div className="schedule-search"><Search size={18} /><input value={scheduleSearch} onChange={(event) => setScheduleSearch(event.target.value)} placeholder="Search scheduled tasks" /></div><h2>Suggestions</h2><div className="schedule-suggestions">{[['Daily brief','Weekdays at 8:00 AM','Start each weekday with a summary of your calendar, unread email, and priorities', '#3e91ff'],['Weekly review','Fridays at 4:00 PM','Turn your recent work into a concise status update every Friday', '#a476ff'],['Follow-up monitor','Weekdays at 9:00 AM','Review recent email and calendar activity and flag anything that needs your attention', '#41d98c']].filter(([title, time, description]) => !scheduleSearch.trim() || `${title} ${time} ${description}`.toLowerCase().includes(scheduleSearch.toLowerCase())).map(([title, time, description, color]) => <button type="button" className="schedule-row" key={title} onClick={() => { setInput(`Set up a scheduled task: ${title}, ${time}. ${description}`); selectWorkspace('Personal assistant'); }}><AlarmClock size={19} style={{color}} /><span><strong>{title}</strong><em>{time}</em><small>{description}</small></span><span className="schedule-arrow">›</span></button>)}{scheduleSearch && !['Daily brief','Weekly review','Follow-up monitor'].some((title) => title.toLowerCase().includes(scheduleSearch.toLowerCase())) && <div className="schedule-empty">No scheduled tasks match your search.</div>}</div>{scheduleManualOpen && <form className="manual-task" onSubmit={(event) => { event.preventDefault(); setScheduleManualOpen(false); setInput('Create this scheduled task: ' + new FormData(event.currentTarget).get('task')); selectWorkspace('Personal assistant'); }}><div><strong>Set up manually</strong><button type="button" onClick={() => setScheduleManualOpen(false)} aria-label="Close manual setup"><X size={16} /></button></div><input name="task" required placeholder="What should Jerry schedule?" autoFocus /><button className="send" type="submit">Continue</button></form>}</div></section>}
      {activeView === 'gmail' && <section className="chat-area"><div className="conversation"><div className="welcome"><div className="welcome-icon"><Mail size={25} /></div><div><p className="eyebrow">GMAIL</p><h1>Send email<br /><em>securely.</em></h1><p className="subcopy">Connect your Gmail account, review the message, and send only when you approve it.</p></div></div>{!gmail.connected ? <div style={{background:'#fff',border:'1px solid #dceafa',borderRadius:14,padding:20,boxShadow:'0 8px 24px #27629812'}}><p style={{marginTop:0,color:'#304f70',fontSize:14,lineHeight:1.6}}>Connect Jerry to Gmail using Google’s secure authorization screen.</p><a href="/api/gmail/auth" className="top-action" style={{display:'inline-flex',textDecoration:'none'}}>Connect Gmail</a></div> : <form onSubmit={sendEmail} style={{display:'grid',gap:12,background:'#fff',border:'1px solid #dceafa',borderRadius:14,padding:20,boxShadow:'0 8px 24px #27629812'}}><div style={{color:'#4b7397',fontSize:12}}>Connected as {gmail.email}</div><input required value={emailDraft.to} onChange={(event) => setEmailDraft({ ...emailDraft, to: event.target.value })} placeholder="Recipient email" style={{border:'1px solid #cfe1f3',borderRadius:10,padding:12,font:'inherit'}} /><input required value={emailDraft.subject} onChange={(event) => setEmailDraft({ ...emailDraft, subject: event.target.value })} placeholder="Subject" style={{border:'1px solid #cfe1f3',borderRadius:10,padding:12,font:'inherit'}} /><textarea required value={emailDraft.text} onChange={(event) => setEmailDraft({ ...emailDraft, text: event.target.value })} placeholder="Write your email..." rows="8" style={{border:'1px solid #cfe1f3',borderRadius:10,padding:12,font:'inherit',resize:'vertical'}} /><button className="send" type="submit" style={{width:'fit-content',padding:'0 18px'}}>Send email</button>{emailStatus && <div style={{fontSize:12,color:emailStatus.includes('successfully') ? '#23845c' : '#b34d5b'}}>{emailStatus}</div>}</form>}<button type="button" className="top-action" onClick={() => selectWorkspace('Personal assistant')} style={{marginTop:24}}>← Back to Jerry</button></div></section>}
      <div className="composer-wrap" style={{display:activeView === 'assistant' ? 'block' : 'none'}}><form className="composer" onSubmit={sendMessage}><div style={{position:'relative'}}><button type="button" aria-label="Add" title="Add" onClick={() => setAddMenuOpen((open) => !open)} style={{width:36,height:36,border:0,borderRadius:10,display:'grid',placeItems:'center',cursor:'pointer',color:'#397fe0',background:addMenuOpen ? '#dcecff' : '#eaf4ff'}}><Plus size={19} /></button>{addMenuOpen && <div style={{position:'absolute',bottom:46,left:0,width:255,padding:8,border:'1px solid #d3e4f4',borderRadius:14,background:'#fff',boxShadow:'0 14px 30px #1c4f8026',zIndex:8}}><div style={{fontSize:11,color:'#7894af',padding:'5px 9px 8px',fontWeight:700}}>Add</div><button type="button" onClick={() => fileInputRef.current?.click()} style={{width:'100%',border:0,borderRadius:9,background:'transparent',padding:'10px 9px',display:'flex',alignItems:'center',gap:9,textAlign:'left',font:'inherit',color:'#304f70',cursor:'pointer'}}><Paperclip size={16} /> <span>Files and folders</span></button><button type="button" onClick={() => { setAddMenuOpen(false); setInput('Help me define a clear goal and break it into achievable steps.'); }} style={{width:'100%',border:0,borderRadius:9,background:'transparent',padding:'10px 9px',display:'flex',alignItems:'center',gap:9,textAlign:'left',font:'inherit',color:'#304f70',cursor:'pointer'}}><Target size={16} /> <span>Goal <small style={{color:'#8aa0b5'}}>Set a goal to keep pursuing</small></span></button><button type="button" onClick={() => { setPlanMode((enabled) => !enabled); setAddMenuOpen(false); }} style={{width:'100%',border:0,borderRadius:9,background:planMode ? '#edf0ff' : 'transparent',padding:'10px 9px',display:'flex',alignItems:'center',gap:9,textAlign:'left',font:'inherit',color:'#304f70',cursor:'pointer'}}><Lightbulb size={16} /> <span>Plan mode <small style={{color:planMode ? '#6a59d9' : '#8aa0b5'}}>{planMode ? 'On' : 'Turn plan mode on'}</small></span></button></div>}</div><input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.txt,.md,.csv,.json,.log" style={{display:'none'}} onChange={handleFiles} /><div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:6}}>{attachments.length > 0 && <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{attachments.map((file,index) => <div key={`${file.name}-${index}`} style={{position:'relative',display:'flex',alignItems:'center',gap:8,minWidth:150,maxWidth:220,padding:'7px 25px 7px 9px',borderRadius:10,background:'#eef5fb',border:'1px solid #d4e5f3',color:'#426886',fontSize:11}}>{file.type.startsWith('image/') ? <img src={URL.createObjectURL(file)} alt="" style={{width:28,height:28,objectFit:'cover',borderRadius:6}} /> : <Paperclip size={17} />}<span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeAttachment(index)} style={{position:'absolute',right:5,top:5,width:17,height:17,border:0,borderRadius:'50%',background:'#fff',color:'#6b8094',cursor:'pointer',lineHeight:1}}>×</button></div>)}</div>}<textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(event); } }} placeholder={planMode ? 'Plan mode: describe what you want to organize...' : 'Message Jerry...'} rows="1" /></div><button type="button" onClick={toggleVoice} aria-label={listening ? 'Stop microphone' : 'Use microphone'} title={listening ? 'Stop microphone' : 'Use microphone'} style={{width:listening ? 92 : 74,height:36,border:0,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',color:listening ? '#fff' : '#397fe0',background:listening ? '#e85d75' : '#eaf4ff'}}>{listening ? <MicOff size={18} /> : <Mic size={18} />}<span>{listening ? 'Stop' : 'Talk'}</span></button><button className="send" disabled={(!input.trim() && !attachments.length) || loading} aria-label="Send message"><Send size={18} /></button></form><div className="composer-note">{planMode ? 'Plan mode is on. Jerry will structure your request into clear steps.' : voiceStatus || (listening ? 'Listening… speak now, then tap Stop.' : 'Jerry automatically searches the web when you ask about current information.')}</div>{(error || voiceError) && <div className="error"><span>{error || voiceError}</span><button onClick={() => { setError(''); setVoiceError(''); }}>Dismiss</button></div>}</div>
    </main>
  </div>;
}
