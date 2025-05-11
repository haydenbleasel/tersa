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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const EmailLayout = ({ children }: EmailLayoutProps) => (
  <Tailwind>
    <Body className="bg-[#f6f9fc] font-sans">
      <Container className="mx-auto mb-16 bg-white py-5 pb-12">
        <Section className="px-12">
          <Img
            src={`${baseUrl}/static/tersa.png`}
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
