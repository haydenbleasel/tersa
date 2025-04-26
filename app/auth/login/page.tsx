import { LoginForm } from '@/components/supabase-ui/login-form';

export const metadata = {
  title: 'Login',
  description: 'Login to your account',
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
