# Specification

## Product Intent

Alyuid is a multilingual web suite for small, practical tasks. It is delivered as one Nuxt application with a shared interface and independent feature areas.

The root route is a concise, searchable app directory. Each available app has a stable route, a clear purpose, and an immediately usable workflow. Vocal Practice is visually featured in the directory because it is the most substantial experience, but it does not define or own the rest of the suite.

Alyuid should remain simple and focused. Accounts, cross-device synchronization, collaboration, social features, advertising workflows, and general project management are outside the current product scope.

## Shared Product Requirements

- List available apps before planned apps while preserving registry order within each status group.
- Do not link planned apps to unfinished routes.
- Give every app a stable slug, localized name and description, category, route, status, and distinct mark.
- Visually identify Vocal Practice as the featured app in the directory.
- Share navigation, typography, spacing, colors, controls, accessibility behavior, localization, and light/dark themes.
- Support English, Spanish, and Turkish for all user-facing interface text and Vocal Practice content.
- Keep each app's domain state and behavior within `app/features/<app>/`.
- Prefer browser-local processing and clearly disclose any network request or local persistence.
- Keep the suite in one Nuxt application until deployment, ownership, or scaling requirements justify separation.

## App Directory

- The directory is available at `/`.
- Users can search available and planned apps by localized name, description, or category.
- Available apps are links; planned apps are non-interactive cards.
- The directory must remain a utility index rather than a marketing landing page.

## Vocal Practice

Vocal Practice is available at `/vocal`. It helps people understand a vocal topic quickly and begin a practical exercise without reading long articles or navigating a course platform.

### Topics and content

- Organize practice around breathing, posture, warm-ups, pitch, resonance, vocal range, and articulation or related focused topics.
- Keep explanations short, practical, accessible to non-experts, and close to the corresponding exercise.
- Store localized topic structure and exercise metadata in Nuxt Content documents.
- Allow multiple exercise variants where timing, syllables, patterns, ranges, or physical checks serve distinct practice goals.
- Favor comfortable, repeatable exercises: airflow awareness, balanced posture, semi-occluded warm-ups, resonant voice, listen-then-match pitch, and short note patterns.
- Do not encourage users to force breath capacity, volume, or vocal range. Show concise safety guidance and advise stopping before strain.

### Practice tools and media

- Provide topic-specific audio or visual guidance only when it improves practice.
- Keep Practice and Tools as internal workspaces within Vocal Practice.
- Provide the current range detector, metronome, piano reference, and generated sound guides as focused practice aids.
- Request microphone access only after an explicit user action. Analyze microphone audio locally and do not record or upload it.
- Use recorded natural audio for human voice examples. Browser text-to-speech must not act as a vocal reference.
- Keep external video guides optional and behind compact actions or modals. Use official embeds or outbound links and provide a YouTube fallback.

### Out of scope

- Courses and long-form lesson libraries
- Teacher, student, class, or marketplace management
- Social networking and public profiles
- Medical diagnosis or treatment advice

## OPML Generator

- Available at `/opml-generator`.
- Let users create, edit, remove, and categorize feed subscriptions.
- Require a title and HTTP(S) XML feed URL; allow an optional HTTP(S) website URL and category.
- Generate valid OPML 2.0 with grouped category outlines.
- Import `.opml` and `.xml` files in replace or merge mode.
- Deduplicate by normalized XML feed URL and preserve the existing entry during merge.
- Retain nested imported categories as category paths.
- Validate before copy or download and provide an XML preview.
- Save a versioned local draft and allow users to clear it explicitly.
- Perform generation, parsing, and persistence in the browser.

## Line Sorter

- Available at `/line-sorter`.
- Sort newline-separated text alphabetically, naturally, or by length in either direction.
- Support case sensitivity, trimming, blank-line removal, and duplicate removal.
- Update the result immediately and provide copy and text-download actions.
- Process text only in the browser and do not persist it.

## Spotify Playlist Printer

- Available at `/spotify-playlist-printer`.
- Accept Spotify HTTPS playlist links, playlist URIs, and 22-character playlist IDs.
- Fetch playlist items directly from Spotify using a manually supplied access token.
- Do not add integrated login, token refresh, a backend proxy, or token persistence in the current version.
- Load all pages with progress and cancellation. Export results only after every page succeeds.
- Preserve track order and duplicates, and represent unavailable items explicitly.
- Support optional numbering, a custom title, artist/title separators, preview, copy, TXT download, and browser printing.
- Explain invalid input, access failures, missing playlists, rate limits, timeouts, network errors, and empty playlists.
- Keep tokens in component memory, send them only to Spotify in authorization headers, never log them, and clear them with the result.

## E-Ink Feed

- Available at `/e-ink-feed`.
- Let users choose presets or add, edit, reorder, and remove custom news sources.
- Support primary and optional lightweight HTTP(S) URLs; reject credentials and non-web schemes.
- Let users configure a page title, text size, spacing, and lightweight-link preference.
- Preview and download the exact same complete UTF-8 `news.html` document.
- Produce a script-free, single-column, high-contrast page with inline CSS, system fonts, and no external assets.
- Preserve source order and open links in the same reader context.
- Store a versioned draft locally and allow explicit clearing. Storage failure must not block editing or export.
- Do not fetch feeds, extract articles, package offline content, host pages, or require an account.

## Table Viewer

- Available at `/table-viewer`.
- Accept pasted delimited text and local UTF-8 CSV, TSV, or text files.
- Detect comma, tab, or semicolon delimiters and allow manual override and single-column data.
- Handle quoted separators, escaped quotes, multiline cells, UTF-8 BOMs, common line endings, duplicate headers, and uneven rows.
- Keep every cell as text, including leading zeroes and formulas, and never execute cell contents.
- Provide case-insensitive search, stable three-state column sorting, original row numbers, sticky headers, horizontal scrolling, counts, and 25/50/100-row pagination.
- Use numeric sorting only when every nonblank value in a column is safely numeric. Sort blanks last.
- Reject malformed or oversized input instead of showing partial data.
- Enforce limits of 5 MB, 10,000 data rows, 200 columns, and 200,000 rectangular cells including headers.
- Process data only in the browser and do not persist it.
- Keep cell editing, formulas, charts, and spreadsheet export outside the current scope.

## Pomodoro Timer

- Available at `/pomodoro`.
- Provide focus, short-break, and long-break sessions with defaults of 25, 5, and 15 minutes.
- Allow durations from 1 to 120 minutes and a long break after 2 to 12 completed focus sessions.
- Provide start, pause, reset, skip, direct session selection, completed-focus tracking, and cycle progress.
- Calculate remaining time from a wall-clock deadline so background throttling does not lengthen a session.
- Advance to the appropriate session at completion and optionally start it automatically.
- Offer optional completion audio generated locally with the Web Audio API.
- Keep settings and progress in the current tab. Do not add accounts, notifications, analytics, or persistent history.

## Color Toolkit

- Available at `/color-toolkit`.
- Accept colors through the browser color picker or a 3- or 6-digit HEX value.
- Normalize valid input and display copyable HEX, RGB, and HSL representations without changing the selected color.
- Generate an ordered tonal palette by mixing the selected color with white and black. Each swatch must expose its copyable HEX value.
- Calculate WCAG contrast ratios for white and black text on the selected color.
- Report AAA, AA, or failure for normal text and AA or better for large text using the corresponding WCAG thresholds.
- Preview readable text using whichever of black or white provides the stronger contrast.
- Perform all calculations locally without uploading or persisting colors.

## QR Code Generator

- Available at `/qr-generator`.
- Encode arbitrary non-empty text or URLs into a standards-compatible QR code entirely in the browser.
- Update the preview when content or settings change and explain when content exceeds the selected capacity.
- Allow output sizes from 160 to 1,024 pixels, quiet-zone margins from 0 to 8 modules, foreground and background colors, and L/M/Q/H error-correction levels.
- Export the current QR code as PNG and self-contained SVG files.
- Encourage users to scan-test customized codes before publishing or printing them.
- Do not upload, save, redirect through, inspect, or otherwise transmit encoded content.

## Date Passed Calculator

- Available at `/date-calculator`.
- Compare two valid calendar dates without applying times of day or time-zone offsets.
- Default to a useful recent range and provide Today, swap, and reset actions.
- Show the elapsed calendar duration in years, months, and days while respecting real month lengths and leap years.
- Show exact totals in days, fractional weeks, hours, and minutes.
- Identify equal dates and indicate when the first date is later than the second while reporting a non-negative span.
- Perform calculations locally without uploading or persisting dates.

## Unit Converter

- Available at `/unit-converter`.
- Convert between common units of length, mass, temperature, speed, and digital storage.
- Update the result immediately when the value, category, or selected units change.
- Provide a swap action that reverses the selected units and carries the current result into the input.
- Use deterministic base-unit conversion factors, with offset-aware formulas for temperature.
- Distinguish decimal storage units such as kB, MB, and GB from binary units such as KiB, MiB, and GiB.
- Keep full numeric precision during calculation while formatting long results for readable display.
- Perform calculations locally without uploading or persisting values.

## Privacy and Data Handling

- The suite has no account system or application backend in its current form.
- Browser-local apps must not upload user input.
- Local draft storage must be disclosed in the relevant interface and removable by the user.
- Spotify credentials may be sent only to Spotify and must never be stored or logged.
- Microphone input may be analyzed only in memory after explicit permission and must not be recorded or uploaded.
