const translate = () => {
    let language = localStorage.getItem('language');
    if (language == null){
        localStorage.setItem('language','en');
        language = 'en';
    }

    const path = window.location.pathname.substring(1) == "" ? "index" : window.location.pathname.substring(1);
    const languageForPage = languageDefinition.filter(x => x.page == path)[0];
    if (languageForPage == null || languageForPage.length == 0){
        return; // Nothing to translate
    }

    // Translate for each key:
    const langKeys = Object.keys(languageForPage.strings);
    langKeys.forEach(key => {
        console.log(`translating ${key} with ${languageForPage.strings[key][language]}`)
        $(`#${key}`).text(languageForPage.strings[key][language]);
    });
}

translate();