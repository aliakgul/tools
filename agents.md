# AI Agent Instructions

## Required Workflow

Before changing code or documentation:

1. Read `README.md`.
2. Read `spec.md`.
3. Read `architecture.md`.
4. Read `agents.md`.
5. Inspect `decisions.md` and the relevant implementation.
6. State any assumption that could affect product direction, architecture, representation, or behavior.
7. Implement the smallest complete change and verify it.

Do not skip the context documents. This repository follows `Repository = Code + Context`; behavior and context must remain aligned.

## Product Rules

- Treat Alyuid as a suite of small, focused web apps.
- Keep `/` a concise, searchable app directory.
- Keep Vocal Practice featured, while preserving it as one independent app at `/vocal`.
- Keep Vocal Practice's Practice and Tools views internal to that app.
- Make each app immediately useful and avoid unrelated secondary workflows.
- Do not introduce accounts, collaboration, social feeds, project management, advertising systems, or a large learning platform without confirmed context changes.
- Keep the interface responsive, accessible, modern, and distraction-free.

## Context Changes

If a request changes a core assumption about product scope, domain model, representation, architecture, privacy, persistence, or external integrations:

1. Explain the impact.
2. Confirm intent when the request itself does not already provide clear authorization.
3. Update `spec.md`, `architecture.md`, or `decisions.md` before or alongside implementation.

Use the existing documentation contract:

- `README.md`: overview, inventory, technology, and entry points
- `spec.md`: required product behavior and boundaries
- `architecture.md`: system structure and data flow
- `agents.md`: rules for coding assistants
- `decisions.md`: durable product and architecture choices

Do not create replacement context files for these purposes.

## Development Rules

- Prefer established Nuxt, Vue, Nuxt Content, Nuxt i18n, Nuxt UI, and Tailwind patterns.
- Register apps in `app/composables/useAppRegistry.js` and give each app a dedicated route and `app/features/<app>/` boundary.
- Keep route components focused on page framing, data loading, and SEO metadata.
- Keep app-specific components, composables, state, and utilities inside their feature directory.
- Do not import code across feature boundaries. Move truly shared behavior into an appropriately shared module.
- Keep `app/components/layouts/`, `app/components/ui/`, and top-level composables free of app-specific domain behavior.
- Reuse shared controls and design tokens while allowing layouts suited to each task.
- Preserve English, Spanish, and Turkish coverage for user-facing text and content.
- Prefer structured content and reusable components over long hard-coded educational pages.
- Use audio, video, microphone access, persistence, or network requests only when they materially support the app's main task.
- Preserve existing LocalStorage keys during branding changes unless an explicit migration is implemented.
- Keep edits scoped and preserve unrelated worktree changes.

## Privacy and Safety

- Default to local processing.
- Disclose external requests and local persistence in the relevant interface.
- Never log, persist, or forward Spotify access tokens outside Spotify requests.
- Request microphone access only after explicit interaction; do not record or upload microphone audio.
- Escape exported user content and validate external URLs.
- Keep vocal guidance practical and conservative. Do not encourage strain or present medical claims.

## Verification

Inspect every changed file and run checks appropriate to the change. Use existing commands where available:

- `node --test app/features/*/utils/*.test.js` for pure feature utilities
- `npm run build` for production compilation
- `npm run dev` when interactive browser review is required

Validate locale JSON and keep translation key sets aligned when localization changes. If a relevant check cannot run, report why.
