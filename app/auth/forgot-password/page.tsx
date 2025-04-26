import { ForgotPasswordForm } from '@/components/supabase-ui/forgot-password-form';

export const metadata = {
  title: 'Forgot password',
  description: 'Forgot password to your account',
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
