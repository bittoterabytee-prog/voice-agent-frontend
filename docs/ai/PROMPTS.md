# Prompts (Frontend context)

System/user prompts for the voice agent are owned by the **backend** AI layer.

The frontend should not embed production agent prompts that bypass backend policy. If a future admin UI edits prompts, changes must persist through secured backend APIs and still obey [`PROJECT_RULES.md`](../../PROJECT_RULES.md).
