import { WaitlistForm } from './components/waitlist-form';

export const metadata = {
  title: 'Join the waitlist',
  description: 'Join the waitlist to get early access to Tersa.',
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <WaitlistForm />
      </div>
    </div>
  );
}
