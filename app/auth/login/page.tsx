import { LoginForm } from './components/login-form';

const title = 'Login';
const description = 'Welcome back. Login to your account to continue.';

export const metadata = {
  title,
  description,
};

export default function Page() {
  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="grid w-full max-w-sm gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-semibold text-2xl">{title}</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
