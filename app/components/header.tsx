import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Header = () => (
  <header className="flex items-center justify-between">
    <Link href="/">
      <Logo className="h-6 w-auto" />
    </Link>
    <div className="flex items-center gap-2">
      <Button variant="outline">
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  </header>
);
