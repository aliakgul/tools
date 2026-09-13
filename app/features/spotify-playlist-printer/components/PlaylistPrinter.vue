<script setup>
import { fetchPlaylist } from "../utils/spotify";
const { t } = useI18n();
const token = ref("");
const playlistInput = ref("");
const title = ref("");
const numbered = ref(false);
const separator = ref(" — ");
const copyState = ref("idle");
const entries = ref([]);
const loadedId = ref("");
const loading = ref(false);
const progress = ref(0);
const errorCode = ref("");
const completed = ref(false);
let activeRequest;
const lines = computed(() =>
  entries.value.map((item) =>
    item ? [item.artists, item.name].filter(Boolean).join(separator.value) : t("playlistPrinter.unavailable"),
  ),
);

async function loadPlaylist() {
  if (loading.value) return;
  errorCode.value = "";
  entries.value = [];
  loadedId.value = "";
  completed.value = false;
  progress.value = 0;
  const request = new AbortController();
  activeRequest = request;
  loading.value = true;
  try {
    const data = await fetchPlaylist({
      input: playlistInput.value,
      token: token.value,
      signal: request.signal,
      onProgress: (count) => {
        if (activeRequest === request) progress.value = count;
      },
    });
    if (activeRequest !== request) return;
    entries.value = data.entries;
    loadedId.value = data.id;
    completed.value = true;
  } catch (error) {
    if (activeRequest === request && !request.signal.aborted) errorCode.value = error.code || "requestFailed";
  } finally {
    if (activeRequest === request) {
      loading.value = false;
      activeRequest = undefined;
    }
  }
}
function cancel() {
  activeRequest?.abort();
  activeRequest = undefined;
  loading.value = false;
}
onBeforeUnmount(cancel);
watch(playlistInput, () => {
  cancel();
  entries.value = [];
  loadedId.value = "";
  completed.value = false;
  errorCode.value = "";
});
const formattedLines = computed(() =>
  lines.value.map((line, index) => (numbered.value ? `${index + 1}. ${line}` : line)),
);
const result = computed(() =>
  lines.value.length ? [title.value.trim(), formattedLines.value.join("\n")].filter(Boolean).join("\n\n") : "",
);
watch(result, () => {
  copyState.value = "idle";
});

async function copyResult() {
  const text = result.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (result.value === text) copyState.value = "copied";
  } catch {
    copyState.value = "error";
  }
}
function downloadResult() {
  if (!result.value) return;
  const url = URL.createObjectURL(new Blob([result.value], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "playlist.txt";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function printResult() {
  if (result.value) window.print();
}
function clear() {
  cancel();
  token.value = "";
  playlistInput.value = "";
  entries.value = [];
  loadedId.value = "";
  completed.value = false;
  errorCode.value = "";
  title.value = "";
  copyState.value = "idle";
}
</script>

<template>
  <section
    class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div class="grid lg:grid-cols-2">
      <form class="grid content-start gap-4 p-5" @submit.prevent="loadPlaylist">
        <h2 class="text-lg font-bold">{{ t("playlistPrinter.input") }}</h2>
        <p id="playlist-help" class="text-sm text-slate-600 dark:text-slate-300">{{ t("playlistPrinter.help") }}</p>
        <label class="grid gap-2 text-sm font-semibold">
          <span>{{ t("playlistPrinter.token") }}</span>
          <input
            v-model="token"
            class="playlist-field"
            type="password"
            autocomplete="off"
            spellcheck="false"
            :disabled="loading"
            aria-describedby="token-help"
            :placeholder="t('playlistPrinter.tokenPlaceholder')" />
        </label>
        <p id="token-help" class="text-xs text-slate-600 dark:text-slate-300">
          {{ t("playlistPrinter.tokenHelp") }}
          <a
            class="underline"
            href="https://developer.spotify.com/documentation/web-api/concepts/authorization"
            target="_blank"
            rel="noopener noreferrer">
            {{ t("playlistPrinter.tokenGuide") }}
          </a>
        </p>
        <label class="grid gap-2 text-sm font-semibold">
          <span>{{ t("playlistPrinter.playlist") }}</span>
          <input
            v-model="playlistInput"
            class="playlist-field"
            type="text"
            spellcheck="false"
            :disabled="loading"
            aria-describedby="playlist-help"
            placeholder="https://open.spotify.com/playlist/…" />
        </label>
        <div class="flex flex-wrap gap-2">
          <UButton
            type="submit"
            color="neutral"
            :loading="loading"
            :disabled="loading || !token.trim() || !playlistInput.trim()"
            icon="i-lucide-download">
            {{ t("playlistPrinter.fetch") }}
          </UButton>
          <UButton v-if="loading" type="button" color="neutral" variant="outline" @click="cancel">
            {{ t("playlistPrinter.cancel") }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            :disabled="!token && !playlistInput && !title"
            @click="clear">
            {{ t("playlistPrinter.clear") }}
          </UButton>
        </div>
        <p v-if="loading" role="status" class="text-sm">{{ t("playlistPrinter.loading", { count: progress }) }}</p>
        <p v-if="errorCode" role="alert" class="text-sm text-red-700 dark:text-red-300">
          {{ t(`playlistPrinter.errors.${errorCode}`) }}
        </p>
        <p v-if="completed && !entries.length" role="status" class="text-sm">
          {{ t("playlistPrinter.emptyPlaylist") }}
        </p>
        <label class="grid gap-2 text-sm font-semibold">
          <span>{{ t("playlistPrinter.listTitle") }}</span>
          <input
            v-model="title"
            class="playlist-field"
            type="text"
            :placeholder="t('playlistPrinter.titlePlaceholder')" />
        </label>
        <label class="grid gap-2 text-sm font-semibold">
          <span>{{ t("playlistPrinter.separator") }}</span>
          <select v-model="separator" class="playlist-field">
            <option value=" — ">—</option>
            <option value=";">;</option>
            <option value=" -> ">→</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="numbered" type="checkbox" class="h-4 w-4 accent-emerald-600" />
          {{ t("playlistPrinter.numbered") }}
        </label>
      </form>
      <div
        class="grid content-start gap-4 border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="playlist-preview-label" class="text-lg font-bold">{{ t("playlistPrinter.preview") }}</h2>
          <span class="text-sm text-slate-600 dark:text-slate-300">
            {{ t("playlistPrinter.count", { count: lines.length }) }}
          </span>
        </div>
        <a
          v-if="loadedId"
          :href="`https://open.spotify.com/playlist/${loadedId}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm underline">
          {{ t("playlistPrinter.openSpotify") }}
        </a>
        <pre
          v-if="result"
          aria-labelledby="playlist-preview-label"
          class="min-h-88 whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm leading-7 dark:border-slate-600 dark:bg-slate-900"
          >{{ result }}</pre>
        <p
          v-else
          class="flex min-h-88 items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
          {{ t("playlistPrinter.empty") }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton color="neutral" :disabled="!result" icon="i-lucide-copy" @click="copyResult">
            {{ t("playlistPrinter.copy") }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            :disabled="!result"
            icon="i-lucide-download"
            @click="downloadResult">
            {{ t("playlistPrinter.download") }}
          </UButton>
          <UButton color="neutral" variant="outline" :disabled="!result" icon="i-lucide-printer" @click="printResult">
            {{ t("playlistPrinter.print") }}
          </UButton>
        </div>
        <p role="status" class="min-h-5 text-sm">
          {{
            copyState === "copied"
              ? t("playlistPrinter.copied")
              : copyState === "error"
                ? t("playlistPrinter.copyFailed")
                : ""
          }}
        </p>
      </div>
    </div>
    <p class="border-t border-slate-200 px-5 py-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
      {{ t("playlistPrinter.privacy") }}
    </p>
    <Teleport to="body">
      <article class="playlist-print-sheet">
        <h1 v-if="title.trim()">{{ title.trim() }}</h1>
        <p v-for="(line, index) in formattedLines" :key="index">{{ line }}</p>
      </article>
    </Teleport>
  </section>
</template>

<style scoped>
.playlist-field {
  width: 100%;
  border: 1px solid var(--ui-border-accented);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: var(--ui-bg);
  color: var(--ui-text);
}
.playlist-field:focus-visible {
  outline: 2px solid #168a62;
  outline-offset: 2px;
}
.playlist-print-sheet {
  display: none;
}
@media print {
  :global(body:has(.playlist-print-sheet) > :not(.playlist-print-sheet)) {
    display: none !important;
  }
  :global(body:has(.playlist-print-sheet)) {
    background: white !important;
    color: black !important;
  }
  .playlist-print-sheet {
    display: block;
    padding: 12mm;
    font: 12pt/1.6 sans-serif;
    color: black;
    background: white;
    overflow-wrap: anywhere;
  }
  .playlist-print-sheet h1 {
    margin-bottom: 1em;
    font-size: 20pt;
  }
  .playlist-print-sheet p {
    break-inside: avoid;
    white-space: pre-wrap;
  }
}
</style>
