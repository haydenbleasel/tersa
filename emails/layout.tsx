import { env } from '@/lib/env';
import {
  Body,
  Container,
  Hr,
  Img,
  Section,
  Tailwind,
} from '@react-email/components';
import type { ReactNode } from 'react';

type EmailLayoutProps = {
  children: ReactNode;
};

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const returnUrl = `${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const EmailLayout = ({ children }: EmailLayoutProps) => (
  <Tailwind>
    <Body className="bg-[#f6f9fc] font-sans">
      <Container className="mx-auto mb-16 bg-white py-5 pb-12">
        <Section className="px-12">
          <Img
            src={new URL('/tersa.png', returnUrl).toString()}
            width="85"
            height="21.5"
            alt="Tersa"
          />
          <Hr className="my-5 border-[#e6ebf1]" />
          {children}
        </Section>
      </Container>
    </Body>
  </Tailwind>
);
