import { OrDivider } from '@/components/or-divider';
import { SocialAuth } from '@/components/social-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { SignUpForm } from './components/sign-up-form';

const title = 'Sign up';
const description = 'Sign up to your account';

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
      <SignUpForm />
    </CardContent>
    <CardFooter className="flex items-center justify-center gap-1 p-4 text-xs">
      <p>Already have an account?</p>
      <Link
        href="/auth/login"
        className="text-primary underline underline-offset-4"
      >
        Login
      </Link>
    </CardFooter>
  </Card>
);

export default LoginPage;
