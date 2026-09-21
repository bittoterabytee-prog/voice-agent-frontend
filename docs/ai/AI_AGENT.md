# AI Agent (Frontend context)

LLM orchestration lives in the **backend** (`src/ai/`). This dashboard does not call LLM providers directly.

## Frontend implications

- No `LLM_API_KEY` (or similar) in Vite env.
- Future “agent activity” panels should show backend-reported tool/LLM events.
- UI copy must not present model hallucinations as booked appointments or medical advice.

See [`PROMPTS.md`](PROMPTS.md), [`TOOL_CALLING.md`](TOOL_CALLING.md), [`RAG.md`](RAG.md).
