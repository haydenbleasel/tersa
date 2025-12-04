import { NextResponse } from "next/server";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";
import { ForgotPasswordEmailTemplate } from "@/emails/forgot-password";
import { LoginEmailTemplate } from "@/emails/sign-in";
import { SignupEmailTemplate } from "@/emails/sign-up";
import { env } from "@/lib/env";
import { parseError } from "@/lib/error/parse";

type WebhookPayload = {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;

    // https://github.com/supabase/auth/blob/master/internal/mailer/template.go#L56-L66
    email_action_type:
      | "signup"
      | "recovery"
      | "invite"
      | "magiclink"
      | "email_change"
      | "email"
      | "email_change_current"
      | "email_change_new"
      | "reauthentication";
    site_url: string;
    token_new: string;
    token_hash_new: string;
  };
};

const resend = new Resend(env.RESEND_TOKEN);

export const POST = async (req: Request) => {
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    const wh = new Webhook(
      env.SUPABASE_AUTH_HOOK_SECRET.replace("v1,whsec_", "")
    );

    const {
      user,
      email_data: {
        token,
        token_hash,
        redirect_to,
        email_action_type,
        site_url,
      },
    } = wh.verify(payload, headers) as WebhookPayload;

    const magicLink = new URL(redirect_to, site_url);

    magicLink.searchParams.set("token", token);
    magicLink.searchParams.set("token_hash", token_hash);
    magicLink.searchParams.set("type", email_action_type);

    let react: ReactElement | undefined;
    let subject: string | undefined;

    if (email_action_type === "signup") {
      react = (
        <SignupEmailTemplate
          email={user.email}
          magicLink={magicLink.toString()}
        />
      );
      subject = "Confirm your email address for Tersa";
    } else if (email_action_type === "magiclink") {
      react = (
        <LoginEmailTemplate
          email={user.email}
          magicLink={magicLink.toString()}
        />
      );
      subject = "Your magic link to login to Tersa";
    } else if (email_action_type === "recovery") {
      react = (
        <ForgotPasswordEmailTemplate
          email={user.email}
          magicLink={magicLink.toString()}
        />
      );
      subject = "Reset your password for Tersa";
    } else {
      throw new Error("Invalid email action type");
    }

    const { error } = await resend.emails.send({
      from: env.RESEND_EMAIL,
      to: [user.email],
      subject,
      react,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    const message = parseError(error);

    return NextResponse.json(
      {
        error: {
          http_code: 500,
          message,
        },
      },
      { status: 500 }
    );
  }
};
