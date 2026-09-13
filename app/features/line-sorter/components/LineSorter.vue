<script setup>
import { sortLines } from "../utils/lineSorter";

const { locale, t } = useI18n();
const source = ref("");
const mode = ref("alphabetical");
const direction = ref("ascending");
const caseSensitive = ref(false);
const trimLines = ref(false);
const removeBlank = ref(false);
const removeDuplicates = ref(false);
const copyState = ref("idle");

const result = computed(() =>
  sortLines(source.value, {
    mode: mode.value,
    direction: direction.value,
    caseSensitive: caseSensitive.value,
    trimLines: trimLines.value,
    removeBlank: removeBlank.value,
    removeDuplicates: removeDuplicates.value,
    locale: locale.value,
  }),
);

const sourceCount = computed(() => (source.value ? source.value.split(/\r?\n/).length : 0));
const resultCount = computed(() => (result.value ? result.value.split("\n").length : 0));

function clearText() {
  source.value = "";
  copyState.value = "idle";
}

async function copyResult() {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(result.value);
    copyState.value = "copied";
    window.setTimeout(() => {
      copyState.value = "idle";
    }, 1800);
  } catch {
    copyState.value = "error";
  }
}

function downloadResult() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sorted-lines.txt";
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <section class="line-sorter-workspace">
    <div class="line-sorter-controls">
      <label>
        <span>{{ t("lineSorter.sortBy") }}</span>
        <select v-model="mode">
          <option value="alphabetical">{{ t("lineSorter.modes.alphabetical") }}</option>
          <option value="natural">{{ t("lineSorter.modes.natural") }}</option>
          <option value="length">{{ t("lineSorter.modes.length") }}</option>
        </select>
      </label>

      <div class="line-sorter-segment" :aria-label="t('lineSorter.order')">
        <button type="button" :class="{ 'is-active': direction === 'ascending' }" @click="direction = 'ascending'">
          <Icon name="lucide:arrow-down-a-z" />
          <span>{{ t("lineSorter.ascending") }}</span>
        </button>
        <button type="button" :class="{ 'is-active': direction === 'descending' }" @click="direction = 'descending'">
          <Icon name="lucide:arrow-up-z-a" />
          <span>{{ t("lineSorter.descending") }}</span>
        </button>
      </div>

      <label class="line-sorter-check">
        <input v-model="caseSensitive" type="checkbox" />
        <span>{{ t("lineSorter.caseSensitive") }}</span>
      </label>
      <label class="line-sorter-check">
        <input v-model="trimLines" type="checkbox" />
        <span>{{ t("lineSorter.trim") }}</span>
      </label>
      <label class="line-sorter-check">
        <input v-model="removeBlank" type="checkbox" />
        <span>{{ t("lineSorter.removeBlank") }}</span>
      </label>
      <label class="line-sorter-check">
        <input v-model="removeDuplicates" type="checkbox" />
        <span>{{ t("lineSorter.removeDuplicates") }}</span>
      </label>
    </div>

    <div class="line-sorter-panes">
      <section class="line-sorter-pane">
        <header>
          <div>
            <p class="eyebrow">{{ t("lineSorter.inputLabel") }}</p>
            <h2>{{ t("lineSorter.inputTitle") }}</h2>
          </div>
          <span>{{ t("lineSorter.lineCount", { count: sourceCount }) }}</span>
        </header>
        <textarea v-model="source" :placeholder="t('lineSorter.placeholder')" spellcheck="false" />
        <button class="line-sorter-clear" type="button" :disabled="!source" @click="clearText">
          <Icon name="lucide:eraser" />
          <span>{{ t("lineSorter.clear") }}</span>
        </button>
      </section>

      <section class="line-sorter-pane line-sorter-pane--result">
        <header>
          <div>
            <p class="eyebrow">{{ t("lineSorter.outputLabel") }}</p>
            <h2>{{ t("lineSorter.outputTitle") }}</h2>
          </div>
          <span>{{ t("lineSorter.lineCount", { count: resultCount }) }}</span>
        </header>
        <textarea :value="result" readonly :placeholder="t('lineSorter.outputPlaceholder')" spellcheck="false" />
        <p v-if="copyState === 'error'" class="line-sorter-error" role="alert">{{ t("lineSorter.copyFailed") }}</p>
        <div class="line-sorter-actions">
          <button type="button" :disabled="!result" @click="copyResult">
            <Icon :name="copyState === 'copied' ? 'lucide:check' : 'lucide:copy'" />
            <span>{{ copyState === "copied" ? t("lineSorter.copied") : t("lineSorter.copy") }}</span>
          </button>
          <button class="is-primary" type="button" :disabled="!result" @click="downloadResult">
            <Icon name="lucide:download" />
            <span>{{ t("lineSorter.download") }}</span>
          </button>
        </div>
      </section>
    </div>

    <div class="line-sorter-privacy">
      <Icon name="lucide:shield-check" />
      <span>{{ t("lineSorter.privacy") }}</span>
    </div>
  </section>
</template>
