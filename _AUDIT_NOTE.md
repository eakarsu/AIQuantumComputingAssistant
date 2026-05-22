# Audit Note — AIQuantumComputingAssistant

## Original audit recommendations (batch_07.md §8)

**Missing AI endpoints:**
- `/algorithm-explainer`
- `/circuit-generator`
- `/optimization-problem-mapper`
- `/hardware-recommendation`
- `/benchmark-analysis`

**Missing non-AI features:** circuit diagram visualization/editor, quantum simulator integration, educational course/lesson structure, benchmarking framework, hardware inventory/provider integration.

**Custom suggestions:** quantum algorithm tutor, problem-to-circuit compiler, hardware benchmarking dashboard, variational circuit optimizer, error mitigation advisor, quantum-classical hybrid planner.

Note: audit only saw `routes/` (auth.js, crudFactory.js); the project actually wires substantial AI in `server/index.js` (15 CRUD-with-AI feature routes plus simulate, transpile, benchmark-run, paper Q&A, global quantum-query). Real AI endpoint count is ~20+, not 0.

## Implemented this pass (3 mechanical)
1. `POST /api/ai/algorithm-explainer` — plain-English explanation of a quantum algorithm at a chosen audience level. Added in `server/index.js`.
2. `POST /api/ai/optimization-problem-mapper` — maps a classical optimization problem to a quantum approach (QAOA/VQE/Grover/annealing) with QUBO sketch, structured JSON.
3. `POST /api/ai/hardware-recommendation` — ranks available `HardwareProfile` rows for a given algorithm/qubit count/depth/priority, structured JSON.

All three reuse existing `queryAI` / `queryAIStructured` helpers and `aiRateLimiter`/`authMiddleware` middleware. Syntax-checked.

## Backlog (prioritized)
1. `POST /api/ai/circuit-generator` — generate QASM circuit from a problem description (mechanical, write-style).
2. `POST /api/ai/benchmark-analysis` — comparative analysis across hardware profiles (extends existing benchmark-run).
3. Variational circuit optimizer endpoint (NEEDS-PRODUCT-DECISION on objective format).
4. Error-mitigation advisor (mechanical follow-up).
5. Educational lesson/course module (NEEDS-PRODUCT-DECISION on content model).
6. Real quantum simulator integration (NEEDS-CREDS — Qiskit Runtime, IBM Quantum, IonQ APIs).

## Apply pass 3 (frontend)

Verified existing FE wiring; **LEFT-AS-IS**.

- All three pass-2 endpoints already have dedicated client pages: `client/src/pages/AlgorithmExplainerPage.js`, `OptimizationProblemMapperPage.js`, `HardwareRecommendationPage.js`.
- `client/src/services/api.js` exports matching axios calls (`algorithmExplainer`, `optimizationProblemMapper`, `hardwareRecommendation`).
- `client/src/App.js` registers the routes `/algorithm-explainer`, `/optimization-problem-mapper`, `/hardware-recommendation`.
- Bearer-from-localStorage auth handled by axios interceptor; 503-no-key surfaced via `err.response?.data?.error` toast in each page.
- No code changes; idempotence rule applied. Log: `_AUDIT/apply3_logs/ab3_59.md`.

## Apply pass 4 (mechanical backlog)

APPLIED — 3 frontend pages wired; backend was already complete.

Backend (already complete from prior sub-pass): `server/index.js` has
- `POST /api/ai/circuit-generator` (line 512)
- `POST /api/ai/benchmark-analysis` (line 564)
- `POST /api/ai/error-mitigation-advisor` (line 640)

All use the shared `queryAI` / `queryAIStructured` helpers, `_noKey()` guard returning 503, `authMiddleware` + `aiRateLimiter`.

Frontend additions this run:
- `client/src/pages/BenchmarkAnalysisPage.js` — NEW page (form: hardware filter, optional benchmark JSON; renders ranking/best-for/summary/recommendations/caveats).
- `client/src/pages/ErrorMitigationAdvisorPage.js` — NEW page (form: circuit description, hardware, noise profile JSON, target fidelity; renders techniques, modifications, post-processing, overhead/gain estimates, caveats).
- `client/src/App.js` — added imports + 3 routes: `/circuit-generator` (page existed but was never wired), `/benchmark-analysis`, `/error-mitigation-advisor`.
- `client/src/components/Sidebar.js` — added 3 entries to "AI Tools" section.

All pages mirror existing `HardwareRecommendationPage`/`AlgorithmExplainerPage` styling (`card`, `form-input`, `btn btn-ai`), use `useToast`, and rely on the axios interceptor in `services/api.js` for `Authorization: Bearer <token>`. 503 responses are surfaced as toast/error banners with explanatory text.

No new deps; no `npm install`. JSX files not syntax-checkable with bare `node --check`; manual structural review against working sibling pages.

Backlog still open after this pass:
- Variational circuit optimizer (NEEDS-PRODUCT-DECISION on objective format).
- Educational lesson/course module (NEEDS-PRODUCT-DECISION on content model).
- Real quantum simulator integration (NEEDS-CREDS — Qiskit Runtime, IBM Quantum, IonQ).

Log: `_AUDIT/apply4_logs/ab3_59.md`.
