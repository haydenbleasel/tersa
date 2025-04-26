import { Panel } from '@xyflow/react';
import Link from 'next/link';
import { Button } from './ui/button';

export const CreateAccount = () => (
  <Panel position="bottom-right">
    <Button className="h-[46px] rounded-full" size="lg" asChild>
      <Link href="/auth/sign-up">Create account</Link>
    </Button>
  </Panel>
);
