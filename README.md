# 🤖 Jerry

<p align="center">
  <img src="https://img.shields.io/badge/Jerry-Personal%20AI%20Assistant-7C3AED?style=for-the-badge" alt="Jerry">
</p>

<h3 align="center">
  Your personal AI assistant for chat, productivity, voice, files, and more.
</h3>

<p align="center">
  Built with React, Vite, Node.js, Express, and local Ollama.
</p>

<p align="center">
  <a href="#-features">Features</a>
  •
  <a href="#-quick-start">Quick Start</a>
  •
  <a href="#-configuration">Configuration</a>
  •
  <a href="#-run-locally">Run Locally</a>
  •
  <a href="#-roadmap">Roadmap</a>
</p>

<br>

<p align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-Backend-000000?style=flat-square&logo=express&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-111111?style=flat-square)

</p>

---

## ✨ About Jerry

**Jerry** is a personal AI assistant built to bring AI-powered conversations and everyday productivity tools into one clean interface.

Instead of being just another chatbot, Jerry is designed as a foundation for a **personal AI workspace**.

It can handle conversations, process voice input, work with files, organize notes and focus items, and optionally connect with Gmail.

> **One assistant. One workspace. Your tools.**

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 💬 AI Chat

Chat with a model running on your own computer through Ollama. Jerry uses Ollama by default and does not need a paid AI account or API key. Current information requests automatically search the web and include source links.

</td>
<td width="50%">

### 🎙️ Voice Input

Dictate messages with Whisper running locally in your browser. No transcription API key is needed. The first use downloads the open-source speech model; later transcriptions run on your device.

</td>
</tr>

<tr>
<td>

### 📎 File Attachments

Attach files and work with information directly from your conversations.

</td>
<td>

### 📝 Notes

Keep important information, ideas, and personal notes organized.

</td>
</tr>

<tr>
<td>

### 🎯 Focus Items

Keep track of important tasks, priorities, and things that need your attention.

</td>
<td>

### 🎨 Themes

Customize the interface and switch between available themes.

</td>
</tr>

<tr>
<td>

### 📧 Gmail Integration

Optionally connect Gmail to allow Jerry to send emails.

</td>
<td>

### 🔐 Secure Architecture

Keep API keys and sensitive credentials on the backend instead of exposing them to the browser.

</td>
</tr>
</table>

---

# 🖥️ Interface

<p align="center">
  <em>Add screenshots of your Jerry interface here</em>
</p>

```text
┌─────────────────────────────────────────────────────────────┐
│  🤖 Jerry                                      ☼  ⚙         │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  New Chat    │              Welcome to Jerry                │
│              │                                              │
│  💬 Chats    │        Your personal AI assistant           │
│              │                                              │
│  📝 Notes    │                                              │
│              │        Ask anything...                       │
│  🎯 Focus    │                                              │
│              │                                              │
│  ⚙ Settings  │  🎙️  📎                    Send ➤           │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

> Replace this section with real screenshots once your UI is finalized.

---

# 🧠 How Jerry Works

```text
                         ┌──────────────────────┐
                         │        USER          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite UI    │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express Server     │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
          │   Ollama    │    │ Browser     │    │    Gmail    │
          │    Chat     │    │ Speech      │    │    OAuth    │
          └─────────────┘    └─────────────┘    └─────────────┘
```

### Request flow

```text
User
  │
  ▼
React UI
  │
  ▼
Express API
  │
  ├──────► Ollama ────► AI Response
  │
  ├──────► Browser speech recognition ───► Transcription
  │
  └──────► Gmail ─────► Email
```

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React |
| ⚡ Build Tool | Vite |
| 🖥️ Backend | Node.js + Express |
| 🧠 AI | Ollama running locally (no API key) |
| 🎙️ Speech-to-Text | Local Whisper model in your browser |
| 📧 Email | Gmail API + Google OAuth |
| 🔐 Configuration | Environment Variables |
| 🚀 App | Local web app and Electron desktop app |

---

# 📁 Project Structure

```text
jerry/
│
├── client/                  # React + Vite frontend
│   ├── components/
│   ├── pages/
│   └── ...
│
├── server/                  # Express backend
│   ├── routes/
│   ├── services/
│   └── ...
│
├── public/                  # Static assets
│
├── .env.example             # Environment template
├── .gitignore               # Git exclusions
├── package.json             # Dependencies & scripts
└── README.md
```

> The exact structure may vary depending on your implementation.

---

# ⚡ Quick Start

Get Jerry running locally in just a few steps.

## 1. Prerequisites

Make sure you have:

- **Node.js 18+**
- **npm**
- **Ollama for macOS, Windows, or Linux**

Verify Node.js:

```bash
node --version
npm --version
```

---

## 2. Install Ollama and download a model

Install Ollama for your operating system from [ollama.com](https://ollama.com/download), then download the modest 3B Llama model. The model files use about 2 GB of disk space; generation speed depends on your CPU and GPU.

```bash
ollama pull llama3.2:3b
```

Ollama runs locally at `http://127.0.0.1:11434`.

## 3. Clone

```bash
git clone https://github.com/YashwanthReddyC1/Jerry-Assistant.git
cd Jerry-Assistant
```

---

## 4. Configure Environment

Create your local `.env` file.

### macOS / Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Ollama is the default. No cloud AI account or API key is required. Keep optional integrations disabled unless you configure their credentials.

To analyze uploaded photos locally without an API key, install the free Ollama vision model with `ollama pull qwen2.5vl:3b` and set `OLLAMA_VISION_MODEL=qwen2.5vl:3b` in `.env`. Jerry uses this model for image attachments and keeps ordinary chat on `OLLAMA_MODEL`.

```env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:3b
OLLAMA_VISION_MODEL=qwen2.5vl:3b
OLLAMA_VISION_CONTEXT_LENGTH=16384
DAILY_MESSAGE_LIMIT=30
RESPONSE_TOKEN_LIMIT=256
CHAT_COOLDOWN_MS=2000
```

### Automatic current web information

Jerry automatically searches the web when a message asks for current or real-time facts. News and update questions use Google News RSS, limited to reports from the past 24 hours, and show clickable source links. Other current questions use DuckDuckGo. Neither search path needs an API key. Ordinary questions do not trigger a search. Keep `WEB_SEARCH_ENABLED=true`; turn it off only to disable all live lookups.

---

## 5. Install

```bash
npm install
```

---

## 6. Start

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

🎉 **Jerry is ready.**

---

# 🎙️ Voice Input

Jerry records audio in the browser and transcribes it with the open-source Whisper model running on your device. No audio is sent to Jerry’s server or to a paid transcription API. The first use downloads the model (an internet connection is needed); the browser then caches it for later use. Allow microphone access when prompted. Model download and transcription speed depend on your connection and device.

### Workflow

```text
🎙️ Talk
   ↓
🎤 Speak
   ↓
🧠 Local Whisper transcription
   ↓
📝 Text appears in message box
   ↓
➤ Send
```

---

# ⚙️ Configuration

All configuration is handled through environment variables.

| Variable | Description | Default |
|---|---|---|
| `AI_PROVIDER` | Chat provider (`ollama`, `groq`, `lyzr`, or `local`) | `ollama` |
| `OLLAMA_MODEL` | Locally installed Ollama chat model | `llama3.2:3b` |
| `OLLAMA_VISION_MODEL` | Locally installed Ollama vision model for photo attachments | `qwen2.5vl:3b` |
| `OLLAMA_VISION_CONTEXT_LENGTH` | Context window for local photo requests, bounded from 8,192 to 32,768 | `16384` |
| `OLLAMA_API_URL` | Ollama chat endpoint | `http://127.0.0.1:11434/api/chat` |
| `DAILY_MESSAGE_LIMIT` | Accepted chat messages per signed-in account each UTC day; `0` disables the cap | `30` |
| `RESPONSE_TOKEN_LIMIT` | Maximum generated tokens per chat response | `256` |
| `CHAT_COOLDOWN_MS` | Minimum delay between messages from the same signed-in account | `2000` |
| `REQUIRE_APP_SIGN_IN` | Require Jerry email and password sign-in for chat and connected APIs | `false` |
| `SESSION_SECRET` | HMAC secret for Jerry sign-in cookies; use 32+ random characters | Not set |
| `SUPABASE_URL` | Supabase project URL used for persistent email/password accounts | Not set |
| `SUPABASE_ANON_KEY` | Supabase public anon key used server-side for Supabase Auth | Not set |
| `WEB_SEARCH_ENABLED` | Allow automatic search for current sources | `true` |
| `GROQ_API_KEY` | Optional key for Groq chat | Empty |
| `GROQ_MODEL` | Chat model when `AI_PROVIDER=groq` | `openai/gpt-oss-20b` |
| `LYZR_API_KEY` | Optional key when `AI_PROVIDER=lyzr` | Not set |
| `PORT` | Express server port | `8787` |
| `CLIENT_ORIGIN` | Frontend origin | — |

For local development, enabling `REQUIRE_APP_SIGN_IN=true` without Supabase credentials uses Jerry’s local account store at `data/local-users.json`; passwords are stored as salted scrypt hashes. That file is excluded from Git.
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |

Usage counters and cooldowns are held in server memory and reset when the server restarts. In public mode they are keyed by signed-in account; use a persistent shared store before running multiple server instances or relying on quotas for abuse prevention.

---

# 🔐 Security

Jerry follows a simple principle:

> **Secrets belong on the server, not in the browser.**

### Never commit:

```text
.env
API keys
OAuth secrets
Access tokens
Private recordings
Private credentials
```

Your `.gitignore` should include:

```gitignore
.env
.env.*
!.env.example
```

Before pushing to GitHub:

```bash
git status
```

Make sure `.env` does not appear.

You can also check tracked files:

```bash
git ls-files
```

---

# 📧 Gmail Integration

Gmail integration is optional.

Jerry can use Google OAuth to send emails on your behalf.

## Local callback

Configure your Google OAuth application with:

```text
http://localhost:8787/api/gmail/callback
```

Then add:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Production

For production Gmail integration:

- Use HTTPS
- Configure the production OAuth callback
- Store OAuth tokens securely
- Use encrypted persistent storage
- Keep OAuth credentials server-side

---

# 📦 Production Build

Build Jerry:

```bash
npm install
npm run build
```

Start production:

```bash
npm start
```

Recommended production configuration:

```env
NODE_ENV=production
PORT=8787
CLIENT_ORIGIN=https://your-domain.com
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:3b
```

---

# 🏠 Run Locally

Jerry is designed to run on your computer so its Ollama model and local account data stay on that device. Install Ollama and the models above, then start Jerry with `npm run dev` for browser use or `npm run desktop:dev` for the desktop app. Live web search is performed only for questions that need current information; AI responses use your local Ollama model.

---

# 🐙 GitHub

Create an empty GitHub repository and run:

```bash
git init

git add .

git commit -m "Initial Jerry assistant"

git branch -M main

git remote add origin https://github.com/YOUR-USERNAME/jerry.git

git push -u origin main
```

### Before pushing

```bash
git status
```

Confirm that `.env` is **not** included.

---

# 🗺️ Roadmap

Jerry is being designed as a foundation for a larger personal AI ecosystem.

### 🧠 Intelligence

- [ ] Long-term memory
- [ ] Better context management
- [ ] Document understanding
- [ ] Web search
- [ ] Retrieval-augmented generation
- [ ] Local LLM support

### 📅 Productivity

- [ ] Calendar integration
- [ ] Reminders
- [ ] Notifications
- [ ] Task management
- [ ] Productivity dashboard

### 🔗 Integrations

- [ ] Advanced Gmail actions
- [ ] Google Calendar
- [ ] Telegram
- [ ] WhatsApp
- [ ] Smart-home integrations
- [ ] More external tools

### 🔐 Platform

- [ ] User authentication
- [ ] Secure session management
- [ ] Encrypted storage
- [ ] Multi-user support
- [ ] Mobile application

---

# 🌟 Vision

Jerry is being built with a bigger goal in mind:

> **Create a personal AI that can understand, assist, organize, and act — all from one place.**

The long-term vision is to evolve Jerry from a simple AI chat interface into a **personal AI operating layer** that connects conversations, knowledge, productivity, and external tools.

```text
                       ┌─────────────────┐
                       │      JERRY      │
                       │   Personal AI   │
                       └────────┬────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
   🧠 Intelligence          📚 Knowledge             ⚡ Actions
       │                        │                        │
       ▼                        ▼                        ▼
   AI Models                Files & Data           External APIs
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                                ▼
                     🧑‍💻 Personal Workspace
```

---

# 🤝 Contributing

Have an idea for Jerry?

You can create a feature branch:

```bash
git checkout -b feature/your-feature
```

Make your changes:

```bash
git add .
git commit -m "Add your feature"
```

Push your branch:

```bash
git push origin feature/your-feature
```

Then open a pull request.

---

# 💙 Built With

<p align="center">

**React** · **Vite** · **Node.js** · **Express** · **Ollama** · **Electron**

</p>

<p align="center">
  Built with ❤️ for a more personal AI experience.
</p>

<p align="center">
  <strong>🤖 Jerry — Your personal AI, built your way.</strong>
</p>
