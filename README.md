# 🤖 Jerry

<p align="center">
  <img src="https://img.shields.io/badge/Jerry-Personal%20AI%20Assistant-7C3AED?style=for-the-badge" alt="Jerry">
</p>

<h3 align="center">
  Your personal AI assistant for chat, productivity, voice, files, and more.
</h3>

<p align="center">
  Built with React, Vite, Node.js, Express, and Ollama.
</p>

<p align="center">
  <a href="#-features">Features</a>
  •
  <a href="#-quick-start">Quick Start</a>
  •
  <a href="#-configuration">Configuration</a>
  •
  <a href="#-deployment">Deployment</a>
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

Have private conversations with Jerry using a model running locally through Ollama. No paid inference API key is needed for chat.

</td>
<td width="50%">

### 🎙️ Voice Input

Record voice and convert it into text using Groq Whisper when an optional Groq key is configured.

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
          │   Groq AI   │    │   Whisper   │    │    Gmail    │
          │    Chat     │    │    Voice    │    │    OAuth    │
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
  ├──────► Whisper ───► Transcription
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
| 🧠 AI | Ollama, running locally |
| 🎙️ Speech-to-Text | Optional Groq Whisper API |
| 📧 Email | Gmail API + Google OAuth |
| 🔐 Configuration | Environment Variables |
| 🚀 Deployment | Node.js-compatible hosting |

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
- **Ollama for Windows**

Verify Node.js:

```bash
node --version
npm --version
```

---

## 2. Install Ollama and download a model

In PowerShell, install Ollama using its official installer, then download the modest 3B Llama model. The model files use about 2 GB of disk space; generation speed depends on your CPU and GPU.

```powershell
irm https://ollama.com/install.ps1 | iex
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

The defaults in `.env.example` already select local Ollama. No Groq or Lyzr key is needed for chat. Optionally add a Groq key only if you want the existing cloud voice transcription feature.

```env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:3b
DAILY_MESSAGE_LIMIT=30
RESPONSE_TOKEN_LIMIT=256
CHAT_COOLDOWN_MS=2000
```

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

Jerry keeps its existing voice recording feature. Transcription currently uses Groq Whisper, so it needs internet access and an optional `GROQ_API_KEY`; local chat continues to work without it. Voice recordings are sent to Groq only when you use this feature.

### Workflow

```text
🎙️ Talk
   ↓
🎤 Record
   ↓
⏹️ Stop
   ↓
☁️ Speech-to-Text
   ↓
📝 Text appears in message box
   ↓
➤ Send
```

Optional transcription model:

```env
GROQ_TRANSCRIBE_MODEL=whisper-large-v3-turbo
```

---

# ⚙️ Configuration

All configuration is handled through environment variables.

| Variable | Description | Default |
|---|---|---|
| `AI_PROVIDER` | Chat provider (`ollama`, `groq`, `lyzr`, or `local`) | `ollama` |
| `OLLAMA_MODEL` | Locally installed Ollama chat model | `llama3.2:3b` |
| `OLLAMA_API_URL` | Ollama chat endpoint | `http://127.0.0.1:11434/api/chat` |
| `DAILY_MESSAGE_LIMIT` | Accepted chat messages per browser user each UTC day; `0` disables the cap | `30` |
| `RESPONSE_TOKEN_LIMIT` | Maximum generated tokens per chat response | `256` |
| `CHAT_COOLDOWN_MS` | Minimum delay between messages from the same browser user | `2000` |
| `GROQ_API_KEY` | Optional key for Groq chat or voice transcription | Empty |
| `GROQ_MODEL` | Chat model when `AI_PROVIDER=groq` | `openai/gpt-oss-20b` |
| `GROQ_TRANSCRIBE_MODEL` | Optional voice transcription model | `whisper-large-v3-turbo` |
| `LYZR_API_KEY` | Optional key when `AI_PROVIDER=lyzr` | Not set |
| `PORT` | Express server port | `8787` |
| `CLIENT_ORIGIN` | Frontend origin | — |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |

Usage counters and cooldowns are held in server memory and reset when the server restarts. For this single-user local setup they provide practical configurable limits; this app does not include account authentication, so they are not suitable as abuse protection for a public multi-user deployment.

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

# ☁️ Deployment

Jerry can run on most Node.js-compatible hosting platforms.

### Supported deployment options

```text
┌─────────────┐
│    GitHub   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│      Hosting Platform       │
│                             │
│  Render / Railway / Fly.io  │
│  VPS / Other Node Hosts     │
└──────────────┬──────────────┘
               │
               ▼
        ┌──────────────┐
        │    Jerry     │
        │  Production  │
        └──────────────┘
```

### Build command

```bash
npm install && npm run build
```

### Start command

```bash
npm start
```

Configure your production secrets through the hosting provider's environment-variable or secret-management system.

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

**React** · **Vite** · **Node.js** · **Express** · **Ollama** · **Groq Whisper (optional)**

</p>

<p align="center">
  Built with ❤️ for a more personal AI experience.
</p>

<p align="center">
  <strong>🤖 Jerry — Your personal AI, built your way.</strong>
</p>
