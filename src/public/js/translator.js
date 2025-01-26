const changeLanguage = (language) => {
    localStorage.setItem('language', language);
    translate();
}

const translate = () => {
    const language = getCurrentLanguage();

    let path = window.location.pathname.substring(1) == "" ? "index" : window.location.pathname.substring(1).toLocaleLowerCase();
    // Gotta patch this one
    if (path.indexOf('schedule/') > -1){
        path = 'schedule';
    }

    // Translate general
    const generalLanguage = languageDefinition.filter(x => x.page == '*')[0];
    if (generalLanguage != null && generalLanguage.strings != null){
        // Translate for each key:
        const generalKeys = Object.keys(generalLanguage.strings);
        generalKeys.forEach(key => {
            if (key != "MomentLocale"){
                $(`${key}`).html(generalLanguage.strings[key][language], );
                //console.log(`translating general ${key} with ${generalLanguage.strings[key][language]}`)
            }
        });
    }

    // Translate current page
    const languageForPage = languageDefinition.filter(x => x.page == path)[0];
    if (languageForPage != null && languageForPage.strings != null){
        // Translate for each key:
        const langKeys = Object.keys(languageForPage.strings);
        langKeys.forEach(key => {
            if (key != "MomentLocale"){
                $(`${key}`).html(languageForPage.strings[key][language]);
                //console.log(`translating ${key} with ${languageForPage.strings[key][language]}`)
            }
        });

        languageForPage.changeLanguageCallback();
    }
}

const getKeyFromLanguage = (page, key) => {
    const languageForPage = languageDefinition.filter(x => x.page == page)[0];
    if (languageForPage != null && languageForPage.strings != null){
        // Translate for each key:
        const langKeys = Object.keys(languageForPage.strings);
        const response = langKeys.find(x => x == key);
        if (response == null)
            return null;

        return languageForPage.strings[key][getCurrentLanguage()];
    }

    return null;
}

const getCurrentLanguage = () => {
    let language = localStorage.getItem('language');
    if (language == null){
        localStorage.setItem('language','en');
        language = 'en';
    }

    // Patch for the change.
    if (language == 'pg'){
        localStorage.setItem('language','pt-br');
        language = 'pt-br';
    }

    return language;
}

window.addEventListener('load', function () {
    translate();
})