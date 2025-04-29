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
import { handleError } from '@/lib/error/handle';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { type FormEventHandler, useState } from 'react';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (error: unknown) {
      handleError('Error sending reset password email', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="gap-0 overflow-hidden bg-secondary p-0">
        <CardHeader className="bg-background py-8">
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>Password reset instructions sent</CardDescription>
        </CardHeader>
        <CardContent className="bg-background pb-8">
          <p className="text-muted-foreground text-sm">
            If you registered using your email and password, you will receive a
            password reset email.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden bg-secondary p-0">
      <CardHeader className="bg-background py-8">
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="rounded-b-xl border-b bg-background pb-8">
        <form onSubmit={handleForgotPassword}>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset email'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="grid divide-y p-0">
        <div className="p-4 text-center text-xs">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="text-primary underline underline-offset-4"
          >
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
