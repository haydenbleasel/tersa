'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { env } from '@/lib/env';
import { handleError } from '@/lib/error/handle';
import { createClient } from '@/lib/supabase/client';
import { Turnstile } from '@marsidev/react-turnstile';
import { useRouter } from 'next/navigation';
import { type FormEventHandler, useState } from 'react';

export const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    undefined
  );

  const handleEmailSignUp: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          captchaToken,
        },
      });

      if (error) {
        throw error;
      }

      router.push('/auth/sign-up-success');
    } catch (error: unknown) {
      handleError('Error signing up with email', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleEmailSignUp}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating an account...' : 'Sign up'}
          </Button>
        </div>
      </form>
      <div className="mt-4">
        {process.env.NODE_ENV === 'production' ? (
          <Turnstile
            siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={setCaptchaToken}
          />
        ) : (
          <p className="text-center text-muted-foreground text-xs">
            Captcha disabled in development
          </p>
        )}
      </div>
    </>
  );
};
