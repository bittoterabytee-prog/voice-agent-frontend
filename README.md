# AI Voice Agent Frontend

Frontend foundation for the AI Voice Agent POC dashboard ([KAN-6](https://voiceagentai.atlassian.net/browse/KAN-6)).

This app provides the monitoring and administration shell: routing, reusable layout components, API client integration, and placeholders for live calls, history, and system status.

## Stack

- React 19
- TypeScript
- Vite
- React Router

## Project structure

```
src/
├── app/            Application root
├── components/     Reusable UI pieces
├── hooks/          Shared hooks (system status, etc.)
├── layouts/        Dashboard shell layout
├── pages/          Route-level pages
├── routes/         Router configuration
├── services/       API client and backend services
├── store/          Lightweight UI state
├── styles/         Global styles
├── types/          Shared TypeScript types
├── utils/          Constants and helpers
└── main.tsx        Entrypoint
tests/              Component and unit tests
```

## Local setup

1. Install Node.js 20 or later.
2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the frontend:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173).

6. (Optional) Start the backend from `voice-agent` so System Status can reach `GET /health`:

   ```bash
   npm run dev
   ```

## Scripts

| Command               | Description                |
| --------------------- | -------------------------- |
| `npm run dev`         | Start Vite dev server      |
| `npm run build`       | Typecheck and production build |
| `npm run preview`     | Preview the production build |
| `npm test`            | Run tests                  |
| `npm run lint`        | Lint TypeScript/React      |
| `npm run format`      | Format files               |
| `npm run format:check`| Check formatting           |

## Configuration

| Variable             | Required | Description                                      |
| -------------------- | -------- | ------------------------------------------------ |
| `VITE_API_BASE_URL`  | no       | Backend API base URL (default `http://localhost:3000`) |

Do not commit `.env` or real secrets.

## Docker

```bash
docker build -t voice-agent-frontend .
docker run --rm -p 8080:80 voice-agent-frontend
```

Build-time API URL:

```bash
docker build --build-arg VITE_API_BASE_URL=http://host.docker.internal:3000 -t voice-agent-frontend .
```
