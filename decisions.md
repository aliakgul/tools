# Architectural Decisions

This file records durable product and architecture choices for Alyuid. Current decisions replace earlier assumptions that described Vocal Practice as the whole product.

## ADR-001: Build a Suite of Focused Apps

Status: Accepted

### Decision

Alyuid is a collection of small web apps. Each app owns one clear task and a stable route. The root route is a concise app directory, and Vocal Practice is visually featured without owning the suite.

### Reasoning

A shared suite makes practical utilities easy to discover while avoiding separate deployments and duplicated navigation. A narrow purpose keeps each app understandable and maintainable.

### Consequences

- New apps require a clear task, registry entry, route, feature boundary, localization, and context update.
- Accounts, collaboration, project management, social features, and overlapping general-purpose workflows require a new product decision.
- The root page remains an app directory rather than a marketing page.

## ADR-002: Treat Context as Source

Status: Accepted

### Decision

`README.md`, `spec.md`, `architecture.md`, `agents.md`, and `decisions.md` form the repository context layer and must remain aligned with code.

### Consequences

- Changes to behavior, architecture, representation, privacy, or scope update the relevant context.
- The defined files retain their documented purposes.

## ADR-003: Use One Nuxt Application with Feature Boundaries

Status: Accepted

### Decision

All current apps run in one Nuxt application. Shared shell code owns navigation, branding, themes, localization, accessibility conventions, and reusable primitives. Each app owns its domain code under `app/features/<app>/`.

### Reasoning

The suite is small enough that one application reduces operational overhead. Explicit feature boundaries prevent domain state and behavior from becoming coupled.

### Consequences

- Feature code must not import another feature's code.
- Route components coordinate pages and SEO; feature components and utilities own app behavior.
- Separate deployments or a monorepo should be considered only for concrete scaling, ownership, or release needs.

## ADR-004: Support English, Spanish, and Turkish Together

Status: Accepted

### Decision

User-facing interface messages and Vocal Practice content maintain English, Spanish, and Turkish coverage.

### Consequences

- Shared message changes update all three locale files.
- Vocal content changes update all three content documents unless explicitly scoped otherwise.
- App names and shared navigation labels should come from localized messages.

## ADR-005: Prefer Local Processing and Explicit Data Boundaries

Status: Accepted

### Decision

Apps process data in the browser by default. Local persistence and external requests are app-specific exceptions that must be minimal and disclosed.

### Consequences

- OPML Generator and E-Ink Feed may keep removable versioned local drafts.
- Spotify Playlist Printer may send an in-memory access token only to Spotify.
- Vocal Practice may analyze microphone input in memory after explicit permission.
- Other current apps do not upload or persist user input.

## ADR-006: Keep Vocal Practice Content-Driven and Practice-Focused

Status: Accepted

### Decision

Vocal topics use localized Nuxt Content metadata for concise guidance and exercise definitions. Vue components provide nearby interaction, audio, and visual feedback. Practice and Tools remain internal views of Vocal Practice.

### Consequences

- Guidance favors comfortable, repeatable practice and avoids medical claims or forced range and breath goals.
- Human voice references use natural recordings rather than text-to-speech.
- External videos remain optional, use official embeds or links, and do not dominate the practice layout.
- The app does not expand into courses, teacher management, a marketplace, or a social network.

## ADR-007: Use Manual Spotify Token Access

Status: Accepted

### Decision

Spotify Playlist Printer accepts a user-supplied access token and fetches playlist items directly from the Spotify Web API. It does not provide integrated login, refresh tokens, a backend proxy, or token persistence.

### Consequences

- Access depends on Spotify permissions and developer-app restrictions.
- Every page must load successfully before results become exportable.
- Tokens remain in memory, are sent only in Spotify authorization headers, and are removed with results when cleared.

## ADR-008: Export E-Ink Feed as Static HTML

Status: Accepted

### Decision

E-Ink Feed exports a complete, script-free HTML directory of links with inline styles and no external assets. It previews the same document it downloads and stores editor drafts only in the browser.

### Consequences

- The export contains links rather than headlines, extracted articles, or offline content.
- Device HTML support and linked-site access remain device- and network-dependent.
- Feed fetching and hosted personal pages require a later scope decision.

## ADR-009: Keep Table Viewer Read-Only

Status: Accepted

### Decision

Table Viewer uses Papa Parse, stores cells as strings in arrays, and offers bounded local parsing, search, stable sorting, and pagination.

### Consequences

- Duplicate headers, leading zeroes, formulas, and uneven rows remain representable without executing or coercing cell content.
- Oversized and malformed inputs are rejected explicitly.
- Editing, calculations, charts, and spreadsheet export remain outside its scope.

## ADR-010: Use Deadline-Based Pomodoro Timing

Status: Accepted

### Decision

Pomodoro Timer keeps state in the current tab and calculates remaining time from a wall-clock deadline. It supports configurable sessions, cycle tracking, optional automatic transitions, and locally generated completion audio.

### Consequences

- Background interval throttling does not lengthen the displayed session.
- Closing or reloading the tab clears session state.
- Accounts, synchronization, notifications, analytics, and persistent history remain outside its scope.

## ADR-011: Restore the Alyuid Product Name

Status: Accepted

### Decision

The visible product brand and metadata use `Alyuid`. The temporary `Tools` product name is retired from user-facing brand copy. “Tools” remains the name of Vocal Practice's internal utility workspace.

### Reasoning

The Alyuid name provides a distinct identity for the collection while the directory and app descriptions continue to communicate its focused utility model.

### Consequences

- Locale messages, page titles, shared navigation, and generated attribution use Alyuid.
- Existing deployment URLs may continue independently of the visible brand.
- Legacy LocalStorage keys retain their existing values to avoid losing saved drafts and preferences.

## ADR-012: Keep Color Calculations Deterministic and Local

Status: Accepted

### Decision

Color Toolkit uses pure feature-local utilities for HEX parsing, RGB and HSL conversion, tonal mixing, relative luminance, and WCAG contrast ratios. Colors remain in memory and are not uploaded or persisted.

### Consequences

- Conversion and palette output can be tested independently from the Vue interface.
- Contrast results use WCAG thresholds and identify conformance for normal and large text separately.
- The first version supports opaque sRGB colors; alpha channels, wide-gamut color spaces, saved palettes, and image extraction remain outside its scope.

## ADR-013: Generate QR Codes in the Browser

Status: Accepted

### Decision

QR Code Generator uses the `qrcode` package to render arbitrary text into a browser canvas and a self-contained SVG. Encoding and downloads happen locally without a remote QR service.

### Reasoning

Local generation protects potentially sensitive encoded content and keeps output available without an application backend. A maintained QR implementation is safer and more interoperable than implementing the encoding standard inside the application.

### Consequences

- The `qrcode` package is a production dependency.
- Users can configure size, quiet-zone margin, colors, and standard error-correction levels.
- The interface should recommend scan-testing because low contrast or unusual colors can reduce real-world readability.
- Saved codes, scan analytics, redirects, styled modules, logos, and structured Wi-Fi or contact forms remain outside the first version.

## ADR-014: Treat Date Inputs as Calendar Days

Status: Accepted

### Decision

Date Passed Calculator parses selected dates as strict date-only values and performs differences on UTC calendar dates. Today shortcuts originate from the user's local calendar date.

### Reasoning

The app compares calendar dates rather than moments in time. Removing time-of-day and time-zone offsets prevents daylight-saving transitions and local parsing rules from creating one-day errors.

### Consequences

- Exact totals use 24-hour calendar days and do not represent elapsed clock time across daylight-saving changes.
- Calendar output respects variable month lengths and leap years.
- Time selection, time zones, business-day rules, holidays, and inclusive-day counting remain outside the first version.

## ADR-015: Convert Through Category Base Units

Status: Accepted

### Decision

Unit Converter defines each category around a base unit. Linear units convert through fixed multipliers, while temperature units use explicit offset-aware formulas. Decimal and IEC binary digital storage units remain distinct.

### Reasoning

A single conversion path avoids a growing matrix of pairwise formulas and keeps calculations deterministic, local, and independently testable.

### Consequences

- Adding a linear unit requires one factor relative to its category base unit.
- Temperature conversions can represent negative values and use Kelvin as the base unit.
- Decimal storage units use powers of 1,000; binary storage units use powers of 1,024.
- Currency, compound units, saved favorites, and remote rate data remain outside the first version.
