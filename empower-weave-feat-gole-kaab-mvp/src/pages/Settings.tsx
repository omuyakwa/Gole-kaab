import React, { useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { startRegistration } from '@simplewebauthn/browser';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Fingerprint } from 'lucide-react';

const Settings = () => {
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const handleRegisterBiometric = async () => {
    setIsRegistering(true);
    try {
      // 1. Get registration options from the server
      const { data: options, error: optionsError } = await supabase.functions.invoke('webauthn-register-challenge');
      if (optionsError) throw optionsError;

      // 2. Pass options to browser's WebAuthn API
      const attestation = await startRegistration(options);

      // 3. Send attestation response to server for verification
      const { data: verification, error: verificationError } = await supabase.functions.invoke('webauthn-register-verify', {
        body: attestation,
      });
      if (verificationError) throw verificationError;

      if (verification.verified) {
        toast({ title: 'Success', description: 'Biometric login enabled.' });
      } else {
        throw new Error('Verification failed.');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and accessibility preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biometric Authentication</CardTitle>
            <CardDescription>Enable passwordless login using your device's biometrics (e.g., fingerprint, face recognition).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRegisterBiometric} disabled={isRegistering}>
              {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
              {isRegistering ? 'Registering...' : 'Enable Biometric Login'}
            </Button>
          </CardContent>
        </Card>

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
