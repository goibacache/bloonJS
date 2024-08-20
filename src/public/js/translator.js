const translate = () => {
    let language = localStorage.getItem('language');
    if (language == null){
        localStorage.setItem('language','en');
        language = 'en';
    }

    let path = window.location.pathname.substring(1) == "" ? "index" : window.location.pathname.substring(1).toLocaleLowerCase();
    // Gotta patch this one
    if (path.indexOf('schedule/') > -1){
        path = 'schedule';
    }

    const languageForPage = languageDefinition.filter(x => x.page == path)[0];
    if (languageForPage == null || languageForPage.length == 0){
        return; // Nothing to translate
    }

    // Translate for each key:
    const langKeys = Object.keys(languageForPage.strings);
    langKeys.forEach(key => {
        // console.log(`translating ${key} with ${languageForPage.strings[key][language]}`)
        $(`#${key}`).text(languageForPage.strings[key][language]);
    });

    // Translate generales
    const generalLanguage = languageDefinition.filter(x => x.page == '*')[0];
    if (generalLanguage == null || generalLanguage.length == 0){
        return; // Nothing in general to translate
    }

    // Translate for each key:
    const generalKeys = Object.keys(generalLanguage.strings);
    generalKeys.forEach(key => {
        // console.log(`translating general ${key} with ${generalLanguage.strings[key][language]}`)
        $(`#${key}`).text(generalLanguage.strings[key][language]);
    });
}

translate();

const changeLanguage = (language) => {
    localStorage.setItem('language', language);
    translate();
}