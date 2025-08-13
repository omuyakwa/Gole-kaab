import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type AccessibilityContextType = {
  fontSize: string;
  highContrast: boolean;
  setFontSize: (size: string) => void;
  setHighContrast: (enabled: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [fontSize, setFontSizeState] = useState('default');
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('font_size, high_contrast')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile for accessibility settings:', error);
        } else if (data) {
          setFontSizeState(data.font_size || 'default');
          setHighContrastState(data.high_contrast || false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    document.body.classList.remove('font-size-default', 'font-size-large', 'font-size-extra-large', 'high-contrast');
    document.body.classList.add(`font-size-${fontSize}`);
    if (highContrast) {
      document.body.classList.add('high-contrast');
    }
  }, [fontSize, highContrast]);

  const updateProfile = async (updates: { font_size?: string; high_contrast?: boolean }) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) {
      console.error('Error updating profile:', error);
    }
  };

  const setFontSize = (size: string) => {
    setFontSizeState(size);
    updateProfile({ font_size: size });
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    updateProfile({ high_contrast: enabled });
  };

  const value = {
    fontSize,
    highContrast,
    setFontSize,
    setHighContrast,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
