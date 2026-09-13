export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  $production: {
    studio: false,
  },

  i18n: {
    strategy: "prefix_except_default",
    defaultLocale: "en",
    customRoutes: "config",
    locales: [
      { code: "en", name: "English", file: "en.json", iso: "en-US" },
      { code: "es", name: "Español", file: "es.json", iso: "es-ES" },
      { code: "tr", name: "Türkçe", file: "tr.json", iso: "tr-TR" },
    ],
    pages: {
      privacy: {
        en: "/privacy",
        tr: "/gizlilik",
        es: "/privacidad",
      },
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },

  routeRules: {
    "/tr/test": { redirect: "/" },
    "/tr/test/**": { redirect: "/" },
  },

  ogImage: {
    enabled: false,
  },

  runtimeConfig: {
    public: {
      // 🔗 Base domain used for canonical + OpenGraph URLs
      siteUrl: "https://alyuid.com",

      // 🏷 Site name used in the title template
      siteName: "Alyuid",

      // 🖼 Default OpenGraph image (recommended to create /public/og/default.png)
      defaultOgImage: "/og/default.png",

      // 🐦 Optional Twitter handle (without @ also works)
      twitterSite: "@yourhandle",

      // 📱 WhatsApp contact
      whatsappNumber: "",

      githubRepositoryUrl: "https://github.com/aliakgul/tools",
    },
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
    storageKey: "alyuid-theme",
    disableTransition: true,
  },

  content: {},

  modules: [
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/content",
    "@nuxt/devtools",
    "@nuxtjs/seo",
    "nuxt-studio",
    "nuxt-anime",
  ],
});
