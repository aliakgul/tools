import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierPlugin from "eslint-plugin-prettier";

export default withNuxt({
    files: ["**/*.{js,vue}"], // Specify files to lint
    ignores: ["node_modules"], // Files or directories to ignore
    plugins: {
        prettier: prettierPlugin,
    },
    rules: {
        "vue/html-self-closing": [
            "warn",
            {
                html: {
                    void: "always",
                    normal: "never",
                },
                svg: "always",
                math: "always",
            },
        ],
        "prettier/prettier": [
            "error",
            {
                htmlWhitespaceSensitivity: "ignore",
                bracketSameLine: true,
                printWidth: 120,
            },
        ],
    },
});
