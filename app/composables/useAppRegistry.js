import { computed } from "vue";

export function useAppRegistry() {
  const { t } = useI18n();
  const localePath = useLocalePath();

  const apps = computed(() => {
    const registry = [
      {
        slug: "vocal",
        name: t("suite.currentTool"),
        description: t("suite.apps.vocal.description"),
        category: t("suite.apps.vocal.category"),
        icon: "lucide:mic-vocal",
        markColor: "#d9466b",
        markForeground: "#ffffff",
        status: "available",
        featured: true,
        path: localePath("/vocal"),
      },
      {
        slug: "spotify-playlist-printer",
        name: t("playlistPrinter.title"),
        description: t("suite.apps.spotifyPlaylistPrinter.description"),
        category: t("suite.apps.spotifyPlaylistPrinter.category"),
        icon: "lucide:printer",
        markColor: "#168a62",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/spotify-playlist-printer"),
      },
      {
        slug: "e-ink-feed",
        name: t("eInk.title"),
        description: t("suite.apps.eInkFeed.description"),
        category: t("suite.apps.eInkFeed.category"),
        icon: "lucide:book-open-text",
        markColor: "#e2ae35",
        markForeground: "#172033",
        status: "available",
        path: localePath("/e-ink-feed"),
      },
      {
        slug: "opml-generator",
        name: t("opml.title"),
        description: t("suite.apps.opmlGenerator.description"),
        category: t("suite.apps.opmlGenerator.category"),
        icon: "lucide:file-code-2",
        markColor: "#147da3",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/opml-generator"),
      },
      {
        slug: "line-sorter",
        name: t("lineSorter.title"),
        description: t("suite.apps.lineSorter.description"),
        category: t("suite.apps.lineSorter.category"),
        icon: "lucide:arrow-down-a-z",
        markColor: "#5d5bd4",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/line-sorter"),
      },
      {
        slug: "table-viewer",
        name: t("tableViewer.title"),
        description: t("suite.apps.tableViewer.description"),
        category: t("suite.apps.tableViewer.category"),
        icon: "lucide:table-2",
        markColor: "#0f766e",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/table-viewer"),
      },
      {
        slug: "pomodoro",
        name: t("pomodoro.title"),
        description: t("suite.apps.pomodoro.description"),
        category: t("suite.apps.pomodoro.category"),
        icon: "lucide:timer",
        markColor: "#e45757",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/pomodoro"),
      },
      {
        slug: "color-toolkit",
        name: t("colorToolkit.title"),
        description: t("suite.apps.colorToolkit.description"),
        category: t("suite.apps.colorToolkit.category"),
        icon: "lucide:palette",
        markColor: "#7c3aed",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/color-toolkit"),
      },
      {
        slug: "qr-generator",
        name: t("qrGenerator.title"),
        description: t("suite.apps.qrGenerator.description"),
        category: t("suite.apps.qrGenerator.category"),
        icon: "lucide:qr-code",
        markColor: "#0891b2",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/qr-generator"),
      },
      {
        slug: "date-calculator",
        name: t("dateCalculator.title"),
        description: t("suite.apps.dateCalculator.description"),
        category: t("suite.apps.dateCalculator.category"),
        icon: "lucide:calendar-range",
        markColor: "#2563eb",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/date-calculator"),
      },
      {
        slug: "unit-converter",
        name: t("unitConverter.title"),
        description: t("suite.apps.unitConverter.description"),
        category: t("suite.apps.unitConverter.category"),
        icon: "lucide:scale",
        markColor: "#0d9488",
        markForeground: "#ffffff",
        status: "available",
        path: localePath("/unit-converter"),
      },
    ];
    const statusOrder = { available: 0, planned: 1 };

    return registry
      .map((app, index) => ({ app, index }))
      .sort((a, b) => statusOrder[a.app.status] - statusOrder[b.app.status] || a.index - b.index)
      .map(({ app }) => app);
  });

  return { apps };
}
