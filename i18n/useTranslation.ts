
import { useAppContext } from '../context/AppContext';
import { translations } from './translations';

type Locale = keyof typeof translations;
type TranslationKey = keyof typeof translations['en'];

export const useTranslation = () => {
  const { locale } = useAppContext();

  const t = (key: TranslationKey, replacements?: { [key: string]: string | number }): string => {
    let translation = translations[locale as Locale]?.[key] || key;

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{{${placeholder}}}`, String(replacements[placeholder]));
        });
    }

    return translation;
  };

  return { t, locale };
};
