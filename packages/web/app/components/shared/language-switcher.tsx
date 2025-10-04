import { useI18n } from '~/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui';
import type { Language } from '~/locales';

const languages: Array<{ value: Language; label: string; flag: string }> = [
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
];

export function LanguageSwitcher() {
  const { language, changeLanguage } = useI18n();

  const handleLanguageChange = (value: string) => {
    changeLanguage(value as Language);
  };

  const currentLanguage = languages.find((lang) => lang.value === language);

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          {currentLanguage && (
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.label}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
