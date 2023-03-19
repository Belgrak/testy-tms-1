module.exports = {
    input: ["./tmp/**/*.{js,jsx}"],
    output: "./",
    options: {
        removeUnusedKeys: true,
        sort: true,
        func: {
            list: ["i18next.t", "i18n.t", "t", "__"],
            extensions: [".ts", ".tsx"],
        },
        trans: false,
        lngs: ["en", "ru"],
        defaultLng: "ru",
        defaultValue: "",
        resource: {
            loadPath: "./public/locales/{{lng}}/translation.json",
            savePath: "./public/locales/{{lng}}/translation.json",
            jsonIndent: 2,
            lineEnding: "\n",
        },
        keySeparator: ".",
        pluralSeparator: "_",
        contextSeparator: "_",
        contextDefaultValues: [],
        interpolation: {
            prefix: "{{",
            suffix: "}}",
        },
    },
}