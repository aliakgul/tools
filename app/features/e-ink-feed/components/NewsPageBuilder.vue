<script setup>
import { buildNewsDocument, parseDraft, safeUrl, sourcePresets, validateSource } from "../utils/document";
const { t, locale } = useI18n();
const DRAFT_KEY = "alyuid-e-ink-feed-v1";
let nextId = 1;
const makeSource = (source) => ({ ...source, id: nextId++ });
const sources = ref(sourcePresets.slice(0, 3).map(makeSource));
const title = ref("");
const preferLite = ref(true);
const fontSize = ref(22);
const spacing = ref("roomy");
const ready = ref(false);
const draftState = ref("idle");
const downloadState = ref(false);
const previewWidth = ref("reader");
const effectiveTitle = computed(() => title.value.trim() || t("eInk.defaultTitle"));
const validations = computed(() => sources.value.map(validateSource));
const valid = computed(
  () => sources.value.length > 0 && validations.value.every((value) => Object.values(value).every(Boolean)),
);
const html = computed(() =>
  buildNewsDocument({
    title: effectiveTitle.value,
    sources: sources.value,
    preferLite: preferLite.value,
    fontSize: fontSize.value,
    spacing: spacing.value,
    language: locale.value,
    liteLabel: t("eInk.lite"),
    footer: t("eInk.exportFooter"),
  }),
);
const draft = computed(() => ({
  version: 1,
  title: title.value,
  sources: sources.value.map(({ title, url, liteUrl, key }) => ({ title, url, liteUrl, key })),
  preferLite: preferLite.value,
  fontSize: fontSize.value,
  spacing: spacing.value,
}));

onMounted(() => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const saved = parseDraft(raw);
      title.value = saved.title;
      sources.value = saved.sources.map(makeSource);
      preferLite.value = saved.preferLite;
      fontSize.value = saved.fontSize;
      spacing.value = saved.spacing;
      draftState.value = "restored";
    }
  } catch {
    draftState.value = "unavailable";
  }
  ready.value = true;
});
watch(
  draft,
  () => {
    downloadState.value = false;
    if (!ready.value) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft.value));
      draftState.value = "saved";
    } catch {
      draftState.value = "unavailable";
    }
  },
  { deep: true, flush: "sync" },
);

function addPreset(preset) {
  if (sources.value.some((source) => source.key === preset.key) || sources.value.length >= 200) return;
  sources.value.push(makeSource(preset));
}
function addCustom() {
  if (sources.value.length < 200) sources.value.push(makeSource({ key: "", title: "", url: "", liteUrl: "" }));
}
function move(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= sources.value.length) return;
  const copy = [...sources.value];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  sources.value = copy;
}
function clearDraft() {
  ready.value = false;
  sources.value = [];
  title.value = "";
  preferLite.value = true;
  fontSize.value = 22;
  spacing.value = "roomy";
  try {
    localStorage.removeItem(DRAFT_KEY);
    draftState.value = "cleared";
  } catch {
    draftState.value = "unavailable";
  }
  ready.value = true;
}
function download() {
  if (!html.value) return;
  const url = URL.createObjectURL(new Blob([html.value], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "news.html";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  downloadState.value = true;
}
</script>

<template>
  <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section class="eink-panel grid gap-5" :aria-label="t('eInk.editor')">
      <div>
        <p class="eyebrow">{{ t("eInk.step1") }}</p>
        <h2 class="text-xl font-bold">{{ t("eInk.sources") }}</h2>
        <p class="mt-2 text-sm text-muted">{{ t("eInk.sourceHelp") }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="preset in sourcePresets"
          :key="preset.key"
          color="neutral"
          variant="outline"
          :disabled="sources.some((source) => source.key === preset.key) || sources.length >= 200"
          icon="i-lucide-plus"
          @click="addPreset(preset)">
          {{ preset.title }}
        </UButton>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm font-semibold">{{ t("eInk.sourceCount", { count: sources.length }) }}</span>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          :disabled="sources.length >= 200"
          @click="addCustom">
          {{ t("eInk.addCustom") }}
        </UButton>
      </div>
      <p v-if="!sources.length" class="rounded-lg border border-dashed border-default p-5 text-sm text-muted">
        {{ t("eInk.noSources") }}
      </p>
      <ol class="grid gap-3">
        <li v-for="(source, index) in sources" :key="source.id" class="rounded-lg border border-default p-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted">{{ index + 1 }}.</span>
            <span class="min-w-0 flex-1 break-words text-sm font-bold">{{ source.title || t("eInk.untitled") }}</span>
            <span v-if="preferLite && safeUrl(source.liteUrl)" class="rounded border border-default px-1.5 text-xs">
              {{ t("eInk.lite") }}
            </span>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-up"
              :disabled="index === 0"
              :aria-label="t('eInk.moveUp', { name: source.title || t('eInk.untitled') })"
              @click="move(index, -1)" />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-down"
              :disabled="index === sources.length - 1"
              :aria-label="t('eInk.moveDown', { name: source.title || t('eInk.untitled') })"
              @click="move(index, 1)" />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              :aria-label="t('eInk.remove', { name: source.title || t('eInk.untitled') })"
              @click="sources.splice(index, 1)" />
          </div>
          <details :open="!source.key" class="mt-2">
            <summary class="cursor-pointer text-xs font-semibold text-muted">{{ t("eInk.edit") }}</summary>
            <div class="mt-3 grid gap-3">
              <label class="eink-label">
                <span>{{ t("eInk.sourceTitle") }}</span>
                <input
                  v-model="source.title"
                  class="eink-field"
                  type="text"
                  maxlength="160"
                  :aria-invalid="!validations[index].title" />
              </label>
              <label class="eink-label">
                <span>{{ t("eInk.url") }}</span>
                <input
                  v-model="source.url"
                  class="eink-field"
                  type="url"
                  placeholder="https://…"
                  :aria-invalid="!validations[index].url" />
              </label>
              <label class="eink-label">
                <span>{{ t("eInk.liteUrl") }}</span>
                <input
                  v-model="source.liteUrl"
                  class="eink-field"
                  type="url"
                  placeholder="https://…"
                  :aria-invalid="!validations[index].liteUrl" />
              </label>
            </div>
          </details>
          <p
            v-if="!Object.values(validations[index]).every(Boolean)"
            class="mt-2 text-xs text-red-700 dark:text-red-300">
            {{ t("eInk.invalidSource") }}
          </p>
        </li>
      </ol>
      <div class="grid gap-4 border-t border-default pt-5">
        <div>
          <p class="eyebrow">{{ t("eInk.step2") }}</p>
          <h2 class="text-xl font-bold">{{ t("eInk.appearance") }}</h2>
        </div>
        <label class="eink-label">
          <span>{{ t("eInk.pageTitle") }}</span>
          <input v-model="title" class="eink-field" :placeholder="t('eInk.defaultTitle')" maxlength="160" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="eink-label">
            <span>{{ t("eInk.textSize") }}</span>
            <select v-model.number="fontSize" class="eink-field">
              <option :value="18">{{ t("eInk.standard") }}</option>
              <option :value="22">{{ t("eInk.large") }}</option>
              <option :value="26">{{ t("eInk.extraLarge") }}</option>
            </select>
          </label>
          <label class="eink-label">
            <span>{{ t("eInk.spacing") }}</span>
            <select v-model="spacing" class="eink-field">
              <option value="roomy">{{ t("eInk.roomy") }}</option>
              <option value="compact">{{ t("eInk.compact") }}</option>
            </select>
          </label>
        </div>
        <label class="flex items-start gap-2 text-sm">
          <input v-model="preferLite" type="checkbox" class="mt-1 h-4 w-4 accent-amber-600" />
          <span>{{ t("eInk.preferLite") }}</span>
        </label>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-xs text-muted" role="status">{{ t(`eInk.draft.${draftState}`) }}</p>
        <UButton color="neutral" variant="ghost" @click="clearDraft">{{ t("eInk.clear") }}</UButton>
      </div>
    </section>

    <section class="eink-panel grid gap-4 lg:sticky lg:top-6" :aria-label="t('eInk.preview')">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="eyebrow">{{ t("eInk.step3") }}</p>
          <h2 class="text-xl font-bold">{{ t("eInk.preview") }}</h2>
        </div>
        <label class="eink-label">
          <span class="sr-only">{{ t("eInk.previewWidth") }}</span>
          <select v-model="previewWidth" class="eink-field">
            <option value="reader">{{ t("eInk.readerWidth") }}</option>
            <option value="wide">{{ t("eInk.wide") }}</option>
          </select>
        </label>
      </div>
      <p class="text-xs text-muted">{{ t("eInk.previewHelp") }}</p>
      <div class="rounded-xl border border-default bg-slate-200 p-3 dark:bg-slate-800">
        <iframe
          v-if="html"
          :srcdoc="html"
          sandbox=""
          inert
          tabindex="-1"
          :title="t('eInk.preview')"
          class="mx-auto block h-[520px] w-full rounded border border-slate-300 bg-white"
          :style="{ maxWidth: previewWidth === 'reader' ? '420px' : '100%' }" />
        <p v-else class="flex min-h-64 items-center justify-center bg-white p-6 text-center text-sm text-slate-600">
          {{ t(sources.length ? "eInk.fixErrors" : "eInk.noSources") }}
        </p>
      </div>
      <UButton size="lg" color="neutral" block icon="i-lucide-download" :disabled="!valid" @click="download">
        {{ t("eInk.download") }}
      </UButton>
      <p v-if="downloadState" role="status" class="text-sm">{{ t("eInk.downloaded") }}</p>
      <details class="rounded-lg border border-default p-4" open>
        <summary class="cursor-pointer text-sm font-bold">{{ t("eInk.transfer") }}</summary>
        <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>{{ t("eInk.transfer1") }}</li>
          <li>{{ t("eInk.transfer2") }}</li>
          <li>{{ t("eInk.transfer3") }}</li>
        </ol>
        <p class="mt-3 text-xs text-muted">{{ t("eInk.compatibility") }}</p>
      </details>
      <p class="text-xs text-muted">{{ t("eInk.privacy") }}</p>
    </section>
  </div>
</template>

<style scoped>
.eink-panel {
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  background: var(--ui-bg);
  padding: 20px;
  min-width: 0;
}
.eink-label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  min-width: 0;
}
.eink-field {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--ui-border-accented);
  border-radius: 8px;
  padding: 9px 10px;
  background: var(--ui-bg);
  color: var(--ui-text);
  font-size: 14px;
}
.eink-field:focus-visible,
summary:focus-visible {
  outline: 2px solid #b87808;
  outline-offset: 3px;
}
</style>
