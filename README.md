# Jerry

Jerry is a personal AI assistant built with React, Vite, Node.js, and Express. It supports chat, file attachments, speech-to-text dictation, themes, notes, focus items, and optional Gmail sending.

## Run Jerry locally

1. Install Node.js 18 or newer.
2. Clone this repository and enter its folder.
3. Copy `.env.example` to a new file named `.env`.
4. Add your own Groq key to `GROQ_API_KEY` in `.env`.
5. Install dependencies and start Jerry:

   ```bash
   npm install
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173).

## Voice input

Click **Talk**, allow microphone access, speak, then click **Stop**. Jerry sends the recording to Groq Whisper for transcription and places the text in the message box. Voice transcription uses `GROQ_TRANSCRIBE_MODEL=whisper-large-v3-turbo` by default.

## Environment variables

Copy `.env.example` and only edit your local `.env` file. The `.env` file is ignored by Git and must never be committed.

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Your private Groq API key for chat and speech transcription. |
| `GROQ_MODEL` | Chat model, default: `openai/gpt-oss-20b`. |
| `GROQ_TRANSCRIBE_MODEL` | Speech-to-text model, default: `whisper-large-v3-turbo`. |
| `PORT` | Jerry server port, default: `8787`. |
| `CLIENT_ORIGIN` | Local or deployed frontend address. |

## Publish to GitHub

Create an empty GitHub repository, then run these commands in this folder:

```bash
git init
git add .
git commit -m "Initial Jerry assistant"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jerry.git
git push -u origin main
```

Before pushing, verify that `git status` does **not** list `.env`. Never upload an API key, OAuth client secret, audio recording, or downloaded project archive.

## Deployment

For Render, Railway, Fly.io, or another Node host:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Set `NODE_ENV=production`, `CLIENT_ORIGIN` to the deployed URL, and add your environment variables through the host's secret settings. Do not upload a `.env` file to the repository.

## Gmail connection

To enable Gmail sending, create a Google OAuth web application and add the following local redirect URI:

```text
http://localhost:8787/api/gmail/callback
```

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`. For a production deployment, use HTTPS and persistent encrypted token storage.
