# 🤖 Jerry

<p align="center">
  <img src="https://img.shields.io/badge/Jerry-Personal%20AI%20Assistant-7C3AED?style=for-the-badge" alt="Jerry">
</p>

<h3 align="center">
  Your personal AI assistant for chat, productivity, voice, files, and more.
</h3>

<p align="center">
  Built with React, Vite, Node.js, Express, and Groq.
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
![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)

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

Have natural conversations with Jerry using a Groq-powered language model.

</td>
<td width="50%">

### 🎙️ Voice Input

Speak naturally and convert your voice into text using Whisper.

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
  ├──────► Groq ──────► AI Response
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
| 🧠 AI | Groq API |
| 🎙️ Speech-to-Text | Whisper |
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
- A **Groq API key**

Verify Node.js:

```bash
node --version
npm --version
```

---

## 2. Clone

```bash
git clone https://github.com/YOUR-USERNAME/jerry.git
cd jerry
```

---

## 3. Configure Environment

Create your local `.env` file.

### macOS / Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Then configure:

```env
GROQ_API_KEY=your_groq_api_key

GROQ_MODEL=openai/gpt-oss-20b
GROQ_TRANSCRIBE_MODEL=whisper-large-v3-turbo

PORT=8787
CLIENT_ORIGIN=http://localhost:5173
```

---

## 4. Install

```bash
npm install
```

---

## 5. Start

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

Jerry includes built-in voice input powered by Whisper.

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

Default model:

```env
GROQ_TRANSCRIBE_MODEL=whisper-large-v3-turbo
```

---

# ⚙️ Configuration

All configuration is handled through environment variables.

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Groq API key | Required |
| `GROQ_MODEL` | Chat model | `openai/gpt-oss-20b` |
| `GROQ_TRANSCRIBE_MODEL` | Speech-to-text model | `whisper-large-v3-turbo` |
| `PORT` | Express server port | `8787` |
| `CLIENT_ORIGIN` | Frontend origin | — |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |

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
GROQ_API_KEY=your_secret_key
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

**React** · **Vite** · **Node.js** · **Express** · **Groq** · **Whisper**

</p>

<p align="center">
  Built with ❤️ for a more personal AI experience.
</p>

<p align="center">
  <strong>🤖 Jerry — Your personal AI, built your way.</strong>
</p>
