# Tournament Formatter - Vercel-ready repository

Quickstart:
1. Create a new GitHub repo and push these files.
2. Import the repo into Vercel and deploy (Project type: Other - static + functions).
3. Visit the deployed site, paste a Smogon thread URL, click Parse, then Generate.

This repo provides:
- /api/fetchSmogon.js : proxy fetch (server-side) to avoid CORS
- /api/parse-thread.js : parse OP into structured matches
- /api/generate-replays.js : output Smogon-ready BBCode for replays
- /api/generate-key.js : generate OP key BBCode for detected teams
