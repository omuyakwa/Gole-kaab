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
import { Loader2 } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const Auth = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, requires2FA, signInWithOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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