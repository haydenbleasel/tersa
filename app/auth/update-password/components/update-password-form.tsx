"use client";

import { useRouter } from "next/navigation";
import { type FormEventHandler, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleError } from "@/lib/error/handle";
import { createClient } from "@/lib/supabase/client";

export const UpdatePasswordForm = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const supabase = createClient();

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      router.push("/");
    } catch (err: unknown) {
      handleError("Error updating password", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgotPassword}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            type="password"
            value={password}
          />
        </div>
        {error ? <p className="text-red-500 text-sm">{error}</p> : null}
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Saving..." : "Save new password"}
        </Button>
      </div>
    </form>
  );
};
