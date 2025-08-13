import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { DashboardSection } from '@/components/sections/DashboardSection';
import { UploadSection } from '@/components/sections/UploadSection';
import { CommunitySection } from '@/components/sections/CommunitySection';

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <DashboardSection />
        <UploadSection />
        <CommunitySection />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('index.footer.title')}</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                {t('index.footer.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('index.footer.features')}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                {t('index.footer.featureList', { returnObjects: true }).map((feature: string) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('index.footer.community')}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                {t('index.footer.communityList', { returnObjects: true }).map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
            <p className="text-primary-foreground/60 text-sm">
              {t('index.footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;