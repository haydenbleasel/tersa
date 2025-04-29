'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { env } from '@/lib/env';
import { GoogleIcon } from '@/lib/icons';
import { createClient } from '@/lib/supabase/client';
import { Turnstile } from '@marsidev/react-turnstile';
import type { Provider } from '@supabase/supabase-js';
import { AppleIcon, GithubIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ElementType, type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

const socialProviders: {
  name: string;
  icon: ElementType;
  id: Provider;
}[] = [
  {
    name: 'Github',
    icon: GithubIcon,
    id: 'github',
  },
  {
    name: 'Google',
    icon: GoogleIcon,
    id: 'google',
  },
  {
    name: 'Apple',
    icon: AppleIcon,
    id: 'apple',
  },
];

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    undefined
  );

  const handleEmailLogin: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
        },
      });
      if (error) {
        throw error;
      }

      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push('/');
    } catch (error: unknown) {
      toast.error('Error logging in with email', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: Provider) => {
    const supabase = createClient();
    setIsLoading(true);

    const redirectUrl = new URL('/auth/oauth', window.location.origin);

    redirectUrl.searchParams.set('next', '/');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl.toString(),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      toast.error('Error logging in with social provider', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {socialProviders.map((provider) => (
            <Button
              key={provider.id}
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleSocialLogin(provider.id)}
            >
              <provider.icon size={16} />
              <span className="sr-only">Continue with {provider.name}</span>
            </Button>
          ))}
        </div>
        <p className="text-center text-sm">or</p>
        <form onSubmit={handleEmailLogin}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
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
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
      {process.env.NODE_ENV === 'production' && (
        <CardFooter className="flex justify-center border-t">
          <Turnstile
            siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={setCaptchaToken}
          />
        </CardFooter>
      )}
    </Card>
  );
};
