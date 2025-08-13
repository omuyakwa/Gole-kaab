import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={i18n.language === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('en')}
      >
        EN
      </Button>
      <Button
        variant={i18n.language === 'so' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('so')}
      >
        SO
      </Button>
    </div>
  );
};
