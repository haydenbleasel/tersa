import Link from "next/link";
import { OrDivider } from "@/components/or-divider";
import { SocialAuth } from "@/components/social-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./components/login-form";

const title = "Login";
const description = "Enter your email or choose a social provider.";

export const metadata = {
  title,
  description,
};

const LoginPage = () => (
  <Card className="gap-0 overflow-hidden bg-secondary p-0">
    <CardHeader className="bg-background py-8">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="rounded-b-xl border-b bg-background pb-8">
      <SocialAuth />
      <OrDivider />
      <LoginForm />
    </CardContent>
    <CardFooter className="flex items-center justify-center gap-1 p-4 text-xs">
      <p>Don&apos;t have an account?</p>
      <Link
        className="text-primary underline underline-offset-4"
        href="/auth/sign-up"
      >
        Sign up
      </Link>
    </CardFooter>
  </Card>
);

export default LoginPage;
