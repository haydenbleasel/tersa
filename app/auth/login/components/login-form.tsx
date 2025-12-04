"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEventHandler, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/lib/env";
import { handleError } from "@/lib/error/handle";
import { createClient } from "@/lib/supabase/client";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    undefined
  );
  const disabled = isLoading || !email || !password || !captchaToken;

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
      router.push("/");
    } catch (error: unknown) {
      handleError("Error logging in with email", error);

      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleEmailLogin}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="ml-auto inline-block text-muted-foreground text-xs underline-offset-4 hover:underline"
                href="/auth/forgot-password"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>
          <Button className="w-full" disabled={disabled} type="submit">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
      <div className="mt-4">
        <Turnstile
          onSuccess={setCaptchaToken}
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
      </div>
    </>
  );
};
