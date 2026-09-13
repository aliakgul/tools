<script setup>
import { calculateDateDifference } from "../utils/date";

const { locale, t } = useI18n();
const localDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const today = () => localDateOnly(new Date());
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateOnly(date);
};
const from = ref(daysAgo(30));
const to = ref(today());
const result = computed(() => calculateDateDifference(from.value, to.value));
const numberFormatter = computed(() => new Intl.NumberFormat(locale.value));
const decimalFormatter = computed(() => new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }));

const totals = computed(() => {
  if (result.value.error) return [];
  return [
    { key: "days", value: numberFormatter.value.format(result.value.totalDays) },
    { key: "weeks", value: decimalFormatter.value.format(result.value.totalWeeks) },
    { key: "hours", value: numberFormatter.value.format(result.value.totalHours) },
    { key: "minutes", value: numberFormatter.value.format(result.value.totalMinutes) },
  ];
});

function setToday(target) {
  if (target === "from") from.value = today();
  else to.value = today();
}

function swapDates() {
  [from.value, to.value] = [to.value, from.value];
}

function resetDates() {
  from.value = daysAgo(30);
  to.value = today();
}
</script>

<template>
  <section class="date-workspace">
    <div class="date-input-card">
      <div class="date-heading">
        <div>
          <p class="eyebrow">{{ t("dateCalculator.inputLabel") }}</p>
          <h2>{{ t("dateCalculator.choose") }}</h2>
        </div>
        <button type="button" @click="resetDates">
          <Icon name="lucide:rotate-ccw" />
          {{ t("dateCalculator.reset") }}
        </button>
      </div>

      <div class="date-fields">
        <label>
          <span>{{ t("dateCalculator.from") }}</span>
          <input v-model="from" type="date" />
          <button type="button" @click="setToday('from')">{{ t("dateCalculator.useToday") }}</button>
        </label>
        <button class="date-swap" type="button" :aria-label="t('dateCalculator.swap')" @click="swapDates">
          <Icon name="lucide:arrow-left-right" />
        </button>
        <label>
          <span>{{ t("dateCalculator.to") }}</span>
          <input v-model="to" type="date" />
          <button type="button" @click="setToday('to')">{{ t("dateCalculator.useToday") }}</button>
        </label>
      </div>
      <p v-if="result.error" class="date-error" role="alert">{{ t("dateCalculator.invalid") }}</p>
    </div>

    <div v-if="!result.error" class="date-result">
      <section class="date-primary-result">
        <p class="eyebrow">{{ t("dateCalculator.resultLabel") }}</p>
        <h2>{{ t(`dateCalculator.direction.${result.direction}`) }}</h2>
        <div class="date-calendar-parts">
          <div>
            <strong>{{ result.years }}</strong>
            <span>{{ t("dateCalculator.units.years", result.years) }}</span>
          </div>
          <div>
            <strong>{{ result.months }}</strong>
            <span>{{ t("dateCalculator.units.months", result.months) }}</span>
          </div>
          <div>
            <strong>{{ result.days }}</strong>
            <span>{{ t("dateCalculator.units.days", result.days) }}</span>
          </div>
        </div>
        <p>{{ t("dateCalculator.calendarHelp") }}</p>
      </section>

      <section class="date-totals">
        <div>
          <p class="eyebrow">{{ t("dateCalculator.totalsLabel") }}</p>
          <h2>{{ t("dateCalculator.totals") }}</h2>
        </div>
        <div class="date-total-grid">
          <article v-for="total in totals" :key="total.key">
            <span>{{ t(`dateCalculator.totalUnits.${total.key}`) }}</span>
            <strong>{{ total.value }}</strong>
          </article>
        </div>
      </section>
    </div>

    <p class="date-note">
      <Icon name="lucide:calendar-check" />
      {{ t("dateCalculator.note") }}
    </p>
  </section>
</template>

<style scoped>
.date-workspace {
  display: grid;
  gap: 1.25rem;
}
.date-input-card,
.date-primary-result,
.date-totals {
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background: var(--ui-bg);
  padding: clamp(1.25rem, 3vw, 2rem);
  box-shadow: 0 12px 35px rgb(15 23 42 / 0.07);
}
.date-heading,
.date-totals > div:first-child {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}
.date-heading h2,
.date-primary-result h2,
.date-totals h2 {
  margin: 0.2rem 0 0;
  color: var(--ui-text-highlighted);
  font-size: 1.4rem;
  font-weight: 900;
}
.date-heading > button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
}
.date-fields {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.date-fields label {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  color: var(--ui-text);
  font-weight: 800;
}
.date-fields label > span {
  grid-column: 1 / -1;
}
.date-fields input {
  min-width: 0;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  padding: 0.8rem;
  font: inherit;
}
.date-fields label button {
  color: #0369a1;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
}
.date-swap {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--ui-border);
  border-radius: 50%;
  background: var(--ui-bg-muted);
  color: var(--ui-text);
  cursor: pointer;
}
.date-error {
  margin: 1rem 0 0;
  color: #be123c;
  font-weight: 700;
}
.date-result {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 1.25rem;
}
.date-primary-result {
  display: grid;
  align-content: start;
  gap: 1rem;
  background: linear-gradient(145deg, color-mix(in srgb, #2563eb 8%, var(--ui-bg)), var(--ui-bg));
}
.date-calendar-parts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}
.date-calendar-parts div {
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.9rem;
  background: var(--ui-bg);
  padding: 1rem 0.5rem;
}
.date-calendar-parts strong {
  color: #2563eb;
  font-size: 2.25rem;
  line-height: 1;
}
.date-calendar-parts span {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: 800;
}
.date-primary-result > p:last-child {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}
.date-totals {
  display: grid;
  gap: 1rem;
}
.date-total-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
}
.date-total-grid article {
  display: grid;
  gap: 0.25rem;
  border-radius: 0.85rem;
  background: var(--ui-bg-muted);
  padding: 1rem;
}
.date-total-grid span {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.date-total-grid strong {
  color: var(--ui-text-highlighted);
  font-size: 1.5rem;
}
.date-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  line-height: 1.5;
}
.date-note svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}
@media (max-width: 720px) {
  .date-result {
    grid-template-columns: 1fr;
  }
  .date-fields {
    grid-template-columns: 1fr;
  }
  .date-swap {
    justify-self: center;
    transform: rotate(90deg);
  }
}
@media (max-width: 420px) {
  .date-calendar-parts {
    grid-template-columns: 1fr;
  }
  .date-total-grid {
    grid-template-columns: 1fr;
  }
}
</style>
