This document lists how to run the main services used while developing the Refugee Aid app.

1) Multilingual Chatbot (FastAPI)
- Location: multilingual chatbot/backend
- Purpose: STT / Chat / TTS endpoints used by mobile ChatModal

Windows PowerShell (one terminal):

cd "c:\Users\suhas\OneDrive\Desktop\refugee-aid-app\multilingual chatbot\backend"
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_server.py

- Server will run at http://127.0.0.1:8000 (Open http://127.0.0.1:8000/docs for API docs).

2) AI matching service (Flask) — runs on port 8001 to avoid conflict
- Location: ai-matching-service

cd "c:\Users\suhas\OneDrive\Desktop\refugee-aid-app\ai-matching-service"
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py

- This Flask app defaults to port 8001 (to avoid colliding with the chatbot FastAPI on 8000).

3) Backend API (Node + TypeScript)
- Location: backend
- Notes: Uses ts-node --esm to run TypeScript directly. If you see ESM import errors, ensure the route files and controller imports use consistent specifiers (recent patches removed in-file .ts specifiers to improve resolution).

cd "c:\Users\suhas\OneDrive\Desktop\refugee-aid-app\backend"
npm install
npx ts-node --esm server.ts

4) Mobile app (Expo)
- Location: RefugeeAidApp
- Notes: We added expo-av and expo-file-system. Install via expo so the correct native modules are linked.

cd "c:\Users\suhas\OneDrive\Desktop\refugee-aid-app\RefugeeAidApp"
npm install
npx expo install expo-av expo-file-system
npx expo start

Troubleshooting tips
- If /api/news returns 404, check backend logs for errors during dynamic route import (server.ts logs loaded modules). If a route failed to import, the server prints an error and exits. Share the exact server log lines and I'll help debug further.
- If mobile audio fails, ensure you installed the expo native modules and restarted the Expo dev server.

If you want, I can:
- Make the multilingual chatbot URL a runtime-configurable value in the app settings (already wired to env/config); or
- Continue debugging the backend ESM import errors and confirm /api/news mounts successfully (I can start the backend here and parse logs if you want me to run commands).
