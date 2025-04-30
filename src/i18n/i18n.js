import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(Backend)
  .init({
    debug: true,
    supportedLngs: ['en', 'am','es', 'fr', 'ru', 'zh', 'ar'],
    ns: ['login','Create','Sidebar','Language','post'],
    fallbackLng: "en",
    returnObjects: true,
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    backend: {
        loadPath: "/public/locales/{{lng}}/{{ns}}.json", 
      },
  });
export default i18n;
