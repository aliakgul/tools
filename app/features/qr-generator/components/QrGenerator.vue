<script setup>
import { createQrSvg, ERROR_LEVELS, normalizeQrOptions, renderQrToCanvas } from "../utils/qr";

const { t } = useI18n();
const canvas = ref();
const value = ref("https://example.com");
const size = ref(320);
const margin = ref(2);
const errorCorrectionLevel = ref("M");
const dark = ref("#111827");
const light = ref("#FFFFFF");
const state = ref("ready");
let renderVersion = 0;

const options = computed(() =>
  normalizeQrOptions({
    size: size.value,
    margin: margin.value,
    errorCorrectionLevel: errorCorrectionLevel.value,
    dark: dark.value,
    light: light.value,
  }),
);
const canExport = computed(() => state.value === "ready" && value.value.trim());

async function render() {
  const version = ++renderVersion;
  if (!value.value.trim()) {
    state.value = "empty";
    const context = canvas.value?.getContext("2d");
    context?.clearRect(0, 0, canvas.value.width, canvas.value.height);
    return;
  }
  try {
    await renderQrToCanvas(canvas.value, value.value, options.value);
    if (version === renderVersion) state.value = "ready";
  } catch {
    if (version === renderVersion) state.value = "tooLong";
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadPng() {
  if (!canExport.value) return;
  canvas.value.toBlob((blob) => {
    if (blob) downloadBlob(blob, "qr-code.png");
  }, "image/png");
}

async function downloadSvg() {
  if (!canExport.value) return;
  try {
    const svg = await createQrSvg(value.value, options.value);
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "qr-code.svg");
  } catch {
    state.value = "tooLong";
  }
}

watch([value, size, margin, errorCorrectionLevel, dark, light], () => nextTick(render));
onMounted(render);
</script>

<template>
  <section class="qr-workspace">
    <div class="qr-editor">
      <div class="qr-input">
        <div>
          <p class="eyebrow">{{ t("qrGenerator.contentLabel") }}</p>
          <h2>{{ t("qrGenerator.content") }}</h2>
          <p>{{ t("qrGenerator.contentHelp") }}</p>
        </div>
        <label>
          <span>{{ t("qrGenerator.text") }}</span>
          <textarea v-model="value" rows="7" :placeholder="t('qrGenerator.placeholder')" />
        </label>
        <p v-if="state === 'tooLong'" class="qr-error" role="alert">{{ t("qrGenerator.tooLong") }}</p>
      </div>

      <div class="qr-options">
        <div>
          <p class="eyebrow">{{ t("qrGenerator.optionsLabel") }}</p>
          <h2>{{ t("qrGenerator.options") }}</h2>
        </div>
        <label>
          <span>
            {{ t("qrGenerator.size") }}
            <strong>{{ size }} px</strong>
          </span>
          <input v-model.number="size" type="range" min="160" max="1024" step="32" />
        </label>
        <label>
          <span>{{ t("qrGenerator.margin") }}</span>
          <input v-model.number="margin" type="number" min="0" max="8" />
        </label>
        <label>
          <span>{{ t("qrGenerator.errorCorrection") }}</span>
          <select v-model="errorCorrectionLevel">
            <option v-for="level in ERROR_LEVELS" :key="level" :value="level">
              {{ t(`qrGenerator.levels.${level}`) }}
            </option>
          </select>
        </label>
        <div class="qr-colors">
          <label>
            <span>{{ t("qrGenerator.foreground") }}</span>
            <input v-model="dark" type="color" />
          </label>
          <label>
            <span>{{ t("qrGenerator.background") }}</span>
            <input v-model="light" type="color" />
          </label>
        </div>
      </div>
    </div>

    <aside class="qr-output">
      <div class="qr-output__heading">
        <div>
          <p class="eyebrow">{{ t("qrGenerator.previewLabel") }}</p>
          <h2>{{ t("qrGenerator.preview") }}</h2>
        </div>
        <span v-if="state === 'ready'">{{ size }} × {{ size }}</span>
      </div>
      <div class="qr-canvas-wrap" :style="{ backgroundColor: light }">
        <canvas ref="canvas" :aria-label="t('qrGenerator.preview')" />
        <p v-if="state === 'empty'">{{ t("qrGenerator.empty") }}</p>
      </div>
      <p class="qr-scan-help">
        <Icon name="lucide:scan-line" />
        {{ t("qrGenerator.scanHelp") }}
      </p>
      <div class="qr-actions">
        <button type="button" :disabled="!canExport" @click="downloadPng">
          <Icon name="lucide:image-down" />
          {{ t("qrGenerator.downloadPng") }}
        </button>
        <button type="button" :disabled="!canExport" @click="downloadSvg">
          <Icon name="lucide:file-code-2" />
          {{ t("qrGenerator.downloadSvg") }}
        </button>
      </div>
      <p class="qr-privacy">
        <Icon name="lucide:shield-check" />
        {{ t("qrGenerator.privacy") }}
      </p>
    </aside>
  </section>
</template>

<style scoped>
.qr-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.75fr);
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background: var(--ui-bg);
  box-shadow: 0 14px 40px rgb(15 23 42 / 0.08);
}
.qr-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.75fr);
  gap: 1.5rem;
  padding: clamp(1.25rem, 3vw, 2rem);
}
.qr-input,
.qr-options {
  display: grid;
  align-content: start;
  gap: 1.25rem;
}
.qr-input h2,
.qr-options h2,
.qr-output h2 {
  margin: 0.2rem 0 0;
  color: var(--ui-text-highlighted);
  font-size: 1.35rem;
  font-weight: 900;
}
.qr-input > div > p:last-child {
  margin: 0.5rem 0 0;
  color: var(--ui-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}
.qr-input label,
.qr-options label {
  display: grid;
  gap: 0.45rem;
  color: var(--ui-text);
  font-size: 0.85rem;
  font-weight: 800;
}
.qr-input textarea,
.qr-options select,
.qr-options input[type="number"] {
  width: 100%;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  padding: 0.75rem;
}
.qr-input textarea {
  min-height: 11rem;
  resize: vertical;
  line-height: 1.5;
}
.qr-options label > span {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}
.qr-options input[type="range"] {
  width: 100%;
  accent-color: #0891b2;
}
.qr-colors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.qr-colors input {
  width: 100%;
  height: 3rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.7rem;
  background: var(--ui-bg);
  padding: 0.2rem;
  cursor: pointer;
}
.qr-output {
  display: grid;
  align-content: start;
  gap: 1rem;
  border-left: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
  padding: clamp(1.25rem, 3vw, 2rem);
}
.qr-output__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}
.qr-output__heading > span {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: 800;
}
.qr-canvas-wrap {
  position: relative;
  display: grid;
  min-height: 18rem;
  place-items: center;
  overflow: auto;
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  padding: 1rem;
}
.qr-canvas-wrap canvas {
  display: block;
  max-width: 100%;
  height: auto !important;
}
.qr-canvas-wrap p {
  position: absolute;
  margin: 0;
  color: #64748b;
  font-weight: 700;
}
.qr-scan-help,
.qr-privacy {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}
.qr-scan-help svg,
.qr-privacy svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}
.qr-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}
.qr-actions button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid #0891b2;
  border-radius: 0.75rem;
  background: #0891b2;
  color: white;
  padding: 0.75rem;
  font-weight: 900;
  cursor: pointer;
}
.qr-actions button:last-child {
  background: transparent;
  color: #0e7490;
}
.qr-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.qr-error {
  margin: 0;
  color: #be123c;
  font-size: 0.85rem;
  font-weight: 700;
}
@media (max-width: 900px) {
  .qr-workspace {
    grid-template-columns: 1fr;
  }
  .qr-output {
    border-top: 1px solid var(--ui-border);
    border-left: 0;
  }
}
@media (max-width: 620px) {
  .qr-editor {
    grid-template-columns: 1fr;
  }
  .qr-actions {
    grid-template-columns: 1fr;
  }
}
</style>
