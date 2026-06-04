import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import hi from "./hi.json";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
  keySeparator: ".",
  nsSeparator: false,
  saveMissing: false,
  missingKeyHandler: (_lng, _ns, key) => {
    if (import.meta.env.DEV) {
      // surfaces gaps during development without breaking the UI
      // (English default passed to t() still renders)
      // eslint-disable-next-line no-console
      console.debug("[i18n] missing key:", key);
    }
  },
});

export default i18n;
