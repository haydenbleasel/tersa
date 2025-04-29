import { SignUpForm } from '@/components/supabase-ui/sign-up-form';

export const metadata = {
  title: 'Sign up',
  description: 'Sign up to your account',
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
