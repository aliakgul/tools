<script setup>
import { delimiters, filterAndSortRows, MAX_BYTES, MAX_ROWS, parseTable } from "../utils/table";
const { t, locale } = useI18n();
const source = ref("");
const committed = ref("");
const parsed = shallowRef(null);
const delimiter = ref("auto");
const hasHeader = ref(true);
const inputOpen = ref(true);
const search = ref("");
const sortColumn = ref(-1);
const direction = ref("ascending");
const page = ref(1);
const pageSize = ref(50);
const reading = ref(false);
const fileName = ref("");
const fileInput = ref(null);
const error = ref("");
const errorRow = ref(1);
let readVersion = 0;

const rows = computed(() => (parsed.value ? parsed.value.rows.slice(hasHeader.value ? 1 : 0) : []));
const headers = computed(() =>
  Array.from({ length: parsed.value?.columns || 0 }, (_, index) =>
    hasHeader.value && parsed.value.rows[0][index]?.trim()
      ? parsed.value.rows[0][index]
      : t("tableViewer.column", { number: index + 1 }),
  ),
);
const visibleRows = computed(() =>
  filterAndSortRows(rows.value, {
    search: search.value,
    column: sortColumn.value,
    direction: direction.value,
    locale: locale.value,
  }),
);
const pages = computed(() => Math.max(1, Math.ceil(visibleRows.value.length / pageSize.value)));
const pageRows = computed(() =>
  visibleRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value),
);
const pending = computed(() => Boolean(parsed.value) && source.value !== committed.value);

function load(text = source.value, collapse = true) {
  committed.value = text;
  const result = parseTable(text, delimiter.value);
  if (result.error) {
    parsed.value = null;
    error.value = result.error;
    errorRow.value = result.row || 1;
    inputOpen.value = true;
    return;
  }
  if (!hasHeader.value && result.rows.length > MAX_ROWS) {
    parsed.value = null;
    error.value = "tooManyRows";
    inputOpen.value = true;
    return;
  }
  parsed.value = result;
  committed.value = text;
  error.value = "";
  search.value = "";
  sortColumn.value = -1;
  page.value = 1;
  if (collapse) inputOpen.value = false;
}
watch(delimiter, () => {
  if (committed.value) load(committed.value, false);
});
watch(hasHeader, () => {
  if (committed.value) load(committed.value, false);
});
watch([search, sortColumn, direction, pageSize, locale], () => {
  page.value = 1;
});

function sort(index) {
  if (sortColumn.value !== index) {
    sortColumn.value = index;
    direction.value = "ascending";
  } else if (direction.value === "ascending") direction.value = "descending";
  else sortColumn.value = -1;
}
function clear() {
  readVersion++;
  reading.value = false;
  source.value = "";
  committed.value = "";
  parsed.value = null;
  fileName.value = "";
  error.value = "";
  search.value = "";
  sortColumn.value = -1;
  page.value = 1;
  inputOpen.value = true;
  if (fileInput.value) fileInput.value.value = "";
}
function example() {
  clear();
  delimiter.value = "auto";
  hasHeader.value = true;
  source.value =
    'Name,City,Score,Notes\nAda,Istanbul,92,"Enjoys music, books"\nDeniz,Ankara,78,"Two lines:\nsecond line"\nAlex,Madrid,100,"Said ""hello"""\nSam,London,8,';
  load();
}
async function openFile(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  const version = ++readVersion;
  error.value = "";
  if (file.size > MAX_BYTES) {
    error.value = "tooLarge";
    return;
  }
  reading.value = true;
  try {
    const buffer = await file.arrayBuffer();
    if (version !== readVersion) return;
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      error.value = "encoding";
      return;
    }
    source.value = text;
    fileName.value = file.name;
    load(text);
  } catch {
    if (version === readVersion) error.value = "readFailed";
  } finally {
    if (version === readVersion) reading.value = false;
  }
}
onBeforeUnmount(() => {
  readVersion++;
});
</script>

<template>
  <section class="grid min-w-0 gap-4">
    <div class="table-panel">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
            class="sr-only"
            tabindex="-1"
            :aria-label="t('tableViewer.openFile')"
            @change="openFile" />
          <UButton
            color="neutral"
            icon="i-lucide-folder-open"
            :loading="reading"
            :disabled="reading"
            @click="fileInput.click()">
            {{ t("tableViewer.openFile") }}
          </UButton>
          <UButton color="neutral" variant="outline" :disabled="reading" @click="example">
            {{ t("tableViewer.example") }}
          </UButton>
          <UButton color="neutral" variant="ghost" :disabled="!source && !parsed && !reading && !error" @click="clear">
            {{ t("tableViewer.clear") }}
          </UButton>
        </div>
        <span class="min-w-0 break-all text-xs text-muted">{{ fileName || t("tableViewer.fileHelp") }}</span>
      </div>
      <details class="mt-4" :open="inputOpen" @toggle="inputOpen = $event.target.open">
        <summary class="cursor-pointer text-sm font-bold">{{ t("tableViewer.input") }}</summary>
        <form class="mt-3 grid gap-3" @submit.prevent="load()">
          <label for="table-source" class="text-sm text-muted">{{ t("tableViewer.inputHelp") }}</label>
          <textarea
            id="table-source"
            v-model="source"
            class="table-field min-h-44 resize-y font-mono"
            :disabled="reading"
            :placeholder="t('tableViewer.placeholder')"
            spellcheck="false"
            @input="fileName = ''" />
          <UButton
            type="submit"
            color="neutral"
            class="justify-self-start"
            :disabled="!source.trim() || reading"
            icon="i-lucide-table-2">
            {{ t("tableViewer.view") }}
          </UButton>
        </form>
      </details>
      <div class="mt-4 flex flex-wrap items-center gap-4 border-t border-default pt-4">
        <label class="flex items-center gap-2 text-sm font-semibold">
          <span>{{ t("tableViewer.delimiter") }}</span>
          <select v-model="delimiter" class="table-field w-auto">
            <option value="auto">{{ t("tableViewer.auto") }}</option>
            <option v-for="(_, key) in delimiters" :key="key" :value="key">
              {{ t(`tableViewer.delimiters.${key}`) }}
            </option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="hasHeader" type="checkbox" class="h-4 w-4 accent-teal-600" />
          <span>{{ t("tableViewer.header") }}</span>
        </label>
        <span v-if="parsed && delimiter === 'auto'" class="text-xs text-muted">
          {{ t("tableViewer.detected", { delimiter: t(`tableViewer.delimiters.${parsed.delimiter}`) }) }}
        </span>
      </div>
      <p v-if="error" role="alert" class="mt-3 text-sm text-red-700 dark:text-red-300">
        {{ t(`tableViewer.errors.${error}`, { row: errorRow }) }}
      </p>
      <p v-if="pending" role="status" class="mt-3 text-sm text-amber-700 dark:text-amber-300">
        {{ t("tableViewer.pending") }}
      </p>
    </div>

    <div v-if="parsed" class="table-panel !p-0 overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 p-4">
        <p role="status" class="text-sm font-semibold">
          {{ t("tableViewer.counts", { shown: visibleRows.length, total: rows.length, columns: headers.length }) }}
        </p>
        <label class="flex min-w-0 items-center gap-2 text-sm">
          <span>{{ t("tableViewer.search") }}</span>
          <input v-model="search" type="search" class="table-field" :placeholder="t('tableViewer.searchPlaceholder')" />
        </label>
      </div>
      <p v-if="parsed.uncertain" class="px-4 pb-3 text-xs text-muted">{{ t("tableViewer.uncertain") }}</p>
      <p v-if="parsed.uneven" class="px-4 pb-3 text-xs text-muted">{{ t("tableViewer.uneven") }}</p>
      <div
        class="max-h-[65vh] overflow-auto border-y border-default focus-visible:outline-2 focus-visible:outline-teal-600"
        tabindex="0"
        role="region"
        :aria-label="t('tableViewer.table')">
        <table class="w-full border-separate border-spacing-0 text-left text-sm">
          <caption class="sr-only">{{ t("tableViewer.table") }}</caption>
          <thead>
            <tr>
              <th scope="col" class="table-heading w-12" :aria-label="t('tableViewer.rowNumber')">#</th>
              <th
                v-for="(heading, index) in headers"
                :key="index"
                scope="col"
                class="table-heading"
                :aria-sort="sortColumn === index ? direction : 'none'">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-teal-600"
                  :aria-label="t('tableViewer.sort', { name: heading })"
                  @click="sort(index)">
                  <span class="whitespace-pre-wrap break-words">{{ heading }}</span>
                  <Icon
                    :name="
                      sortColumn === index
                        ? direction === 'ascending'
                          ? 'lucide:arrow-up'
                          : 'lucide:arrow-down'
                        : 'lucide:arrow-up-down'
                    "
                    class="h-4 w-4 shrink-0" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageRows" :key="row.index" class="even:bg-elevated/50 hover:bg-elevated">
              <th scope="row" class="table-cell text-xs font-normal text-muted">{{ row.index + 1 }}</th>
              <td v-for="(_, index) in headers" :key="index" class="table-cell">
                <div class="min-w-24 max-w-md whitespace-pre-wrap break-words">{{ row.cells[index] ?? "" }}</div>
              </td>
            </tr>
            <tr v-if="!pageRows.length">
              <td :colspan="headers.length + 1" class="p-8 text-center text-muted">
                {{ t(rows.length ? "tableViewer.noMatches" : "tableViewer.noRows") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 p-4">
        <span class="text-xs text-muted">{{ t("tableViewer.sortHelp") }}</span>
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-xs">
            <span>{{ t("tableViewer.perPage") }}</span>
            <select v-model.number="pageSize" class="table-field w-auto">
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </label>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-chevron-left"
            :disabled="page <= 1"
            :aria-label="t('tableViewer.previous')"
            @click="page--" />
          <span class="text-xs">{{ t("tableViewer.page", { page, pages }) }}</span>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-chevron-right"
            :disabled="page >= pages"
            :aria-label="t('tableViewer.next')"
            @click="page++" />
        </div>
      </div>
    </div>
    <div v-else class="rounded-xl border border-dashed border-default px-6 py-12 text-center">
      <Icon name="lucide:table-2" class="mb-3 h-9 w-9 text-muted" />
      <h2 class="text-lg font-bold">{{ t("tableViewer.emptyTitle") }}</h2>
      <p class="mt-2 text-sm text-muted">{{ t("tableViewer.emptyHelp") }}</p>
    </div>
    <p class="text-xs text-muted">{{ t("tableViewer.privacy") }}</p>
  </section>
</template>

<style scoped>
.table-panel {
  min-width: 0;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  border-radius: 12px;
  padding: 20px;
}
.table-field {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
}
select.table-field {
  width: auto;
}
.table-field:focus-visible,
summary:focus-visible {
  outline: 2px solid #0d9488;
  outline-offset: 2px;
}
.table-heading {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--ui-bg-elevated);
  border-bottom: 1px solid var(--ui-border-accented);
  padding: 12px;
  font-weight: 700;
  min-width: 56px;
  max-width: 450px;
}
.table-cell {
  vertical-align: top;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ui-border);
  border-right: 1px solid var(--ui-border);
}
</style>
