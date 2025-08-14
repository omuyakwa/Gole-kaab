import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Fingerprint } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { startAuthentication } from '@simplewebauthn/browser';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const { signIn, signUp, user, requires2FA, signInWithOtp, refreshSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleBiometricSignIn = async () => {
    setIsBiometricLoading(true);
    try {
      // 1. Get login options from the server
      const { data: options, error: optionsError } = await supabase.functions.invoke('webauthn-login-challenge');
      if (optionsError) throw optionsError;

      // 2. Pass options to browser's WebAuthn API
      const assertion = await startAuthentication(options);

      // 3. Send assertion to server for verification
      const { data: verification, error: verificationError } = await supabase.functions.invoke('webauthn-login-verify', {
        body: assertion,
      });
      if (verificationError) throw verificationError;

      if (verification.verified) {
        // This is where a custom JWT would be used to create a session.
        // For this MVP, we'll just refresh the session as the user should already have one.
        await refreshSession();
        toast({ title: 'Success', description: 'Signed in with biometrics.' });
        navigate('/');
      } else {
        throw new Error('Biometric verification failed.');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, requires2FA } = await signIn(email, password);

    if (error) {
      toast({
        title: t('auth.error'),
        description: error.message,
        variant: "destructive",
      });
    } else if (!requires2FA) {
      toast({
        title: t('auth.success'),
        description: t('auth.welcomeBack'),
      });
    }

    setLoading(false);
  };

  const handleOtpSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signInWithOtp(email, otp);

    if (error) {
      toast({
        title: t('auth.error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('auth.success'),
        description: t('auth.welcomeBack'),
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, displayName);

    if (error) {
      toast({
        title: t('auth.error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('auth.success'),
        description: t('auth.accountCreated'),
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">{t('auth.title')}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('auth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requires2FA ? (
            <form onSubmit={handleOtpSignIn} className="space-y-4">
              <div className="space-y-2 text-center">
                <Label htmlFor="otp">{t('auth.otpTitle')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('auth.otpDescription')}
                </p>
              </div>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup className="w-full flex justify-center">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.length < 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.verify')}
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('auth.emailLabel')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('auth.passwordLabel')}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signIn')}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBiometricSignIn}
                    disabled={isBiometricLoading}
                  >
                    {isBiometricLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                    Sign in with biometrics
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.displayNameLabel')}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t('auth.displayNamePlaceholder')}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.emailLabel')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.passwordLabel')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.createAccount')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;