import React from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/components/layout/Header';

const Settings = () => {
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>Customize the application's appearance for your needs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <RadioGroup
                value={fontSize}
                onValueChange={setFontSize}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="fs-default" />
                  <Label htmlFor="fs-default">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="fs-large" />
                  <Label htmlFor="fs-large">Large</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extra-large" id="fs-extra-large" />
                  <Label htmlFor="fs-extra-large">Extra Large</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast-mode">High Contrast Mode</Label>
              <Switch
                id="high-contrast-mode"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Settings;
