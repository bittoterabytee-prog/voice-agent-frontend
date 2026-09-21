# Database Schema (Frontend context)

This repository has **no database**. PostgreSQL lives in the companion backend.

## Tables the dashboard may eventually display

Documented for MCP/onboarding context (authoritative DDL is in the backend `migrations/`):

| Area | Typical tables (backend) |
| ---- | ------------------------ |
| Calls | `calls`, `call_events` |
| Conversation | `conversation_states` |
| Scheduling | `appointments`, `doctors`, `patients` |

## Rules for frontend developers / agents

- Do not create a client-side “schema” that invents columns.
- Do not claim which tables exist without checking backend migrations/docs.
- Appointment availability UI must call APIs that read Postgres — never invent rows in the browser.
