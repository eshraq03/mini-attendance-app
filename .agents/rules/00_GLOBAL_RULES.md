---
trigger: always_on
---

## Strict Engineering Rules for AI Agent

1. **Tech Stack Constraint:** You are strictly forbidden from using React, Vue, Angular, or any other modern frontend frameworks. You must build the entire UI using pure Vanilla JavaScript, HTML5, and standard CSS3.
2. **Error Handling & Traceability:** Every backend function (Netlify Functions) must be wrapped inside a strict `try/catch` block. You must always include explicit `console.error` logs to make troubleshooting fast and transparent.
3.  **Environment Variables & Secrets Guardrail:** You are strictly forbidden from hardcoding any API keys, database credentials, or sensitive configuration strings directly inside the source code. All secrets must be loaded exclusively via environment variables (`process.env`) and managed through Netlify environment configurations.