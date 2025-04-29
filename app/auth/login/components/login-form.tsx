'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';
import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { Turnstile } from '@marsidev/react-turnstile';
import type { Provider } from '@supabase/supabase-js';
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
    icon: SiGithub,
    id: 'github',
  },
  {
    name: 'Twitter',
    icon: SiX,
    id: 'twitter',
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
    <Card className="gap-0 overflow-hidden bg-secondary p-0">
      <CardHeader className="bg-background py-8">
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email or choose a social provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="rounded-b-xl border-b bg-background pb-8">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${socialProviders.length}, 1fr)`,
          }}
        >
          {socialProviders.map((provider) => (
            <Button
              key={provider.id}
              variant="outline"
              className="border"
              size="lg"
              disabled={isLoading}
              onClick={() => handleSocialLogin(provider.id)}
            >
              <provider.icon size={16} />
              <span className="sr-only">Continue with {provider.name}</span>
            </Button>
          ))}
        </div>
        <div className="my-4 flex items-center gap-4">
          <div className="h-px w-full bg-border" />
          <p className="font-medium text-muted-foreground text-xs uppercase">
            or
          </p>
          <div className="h-px w-full bg-border" />
        </div>
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
                  className="ml-auto inline-block text-muted-foreground text-xs underline-offset-4 hover:underline"
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
        </form>
      </CardContent>
      <CardFooter className="grid divide-y p-0">
        <div className="p-4 text-center text-xs">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="text-primary underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
        <div className="p-4">
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
      </CardFooter>
    </Card>
  );
};
