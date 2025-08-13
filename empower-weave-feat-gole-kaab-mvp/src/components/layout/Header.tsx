import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Menu, X, Upload, BarChart3, MessageSquare, Users, LogOut, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { LanguageSelector } from '@/components/ui/language-selector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    }
  };

  const navItems = [
    { icon: BarChart3, label: t('header.nav.dashboard'), href: '#dashboard' },
    { icon: Upload, label: t('header.nav.upload'), href: '#upload' },
    { icon: MessageSquare, label: t('header.nav.community'), href: '#community' },
    { icon: Users, label: t('header.nav.about'), href: '#about' },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-empowering">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('header.title')}</h1>
              <p className="text-xs text-muted-foreground">
                {t('header.subtitle')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105"
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Language Toggle & Mobile Menu */}
          <div className="flex items-center space-x-3">
            <LanguageSelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => window.location.href = '/auth'}
              >
                <User className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};