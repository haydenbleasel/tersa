import { Head, Hr, Html, Link, Preview, Text } from '@react-email/components';
import { EmailLayout } from './layout';

type ForgotPasswordEmailTemplateProps = {
  magicLink: string;
  email: string;
};

export const ForgotPasswordEmailTemplate = ({
  magicLink,
  email,
}: ForgotPasswordEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Reset your password for Tersa</Preview>
    <EmailLayout>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        Hello there! Someone (hopefully you) requested to reset your password
        for Tersa.
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        Click the button below to securely reset your password for your Tersa
        account.
      </Text>
      <Link
        className="block w-full rounded-md bg-[#009869] py-2.5 text-center font-bold text-base text-white no-underline"
        href={magicLink}
      >
        Reset Password
      </Link>
      <Hr className="my-5 border-[#e6ebf1]" />
      <Text className="text-left text-[#525f7f] text-base leading-6">
        This password reset link will expire in 10 minutes. If you didn't
        request to reset your password, you can safely ignore this email.
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        If you're having trouble with the button above, copy and paste the
        following URL into your browser:
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        <Link className="text-[#009869]" href={magicLink}>
          {magicLink}
        </Link>
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        If you have any questions or need assistance, please don't hesitate to
        reach out to our support team.
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        — The Tersa Team
      </Text>
      <Hr className="my-5 border-[#e6ebf1]" />
      <Text className="text-[#8898aa] text-xs leading-4">
        This email was sent to {email}
      </Text>
    </EmailLayout>
  </Html>
);

ForgotPasswordEmailTemplate.PreviewProps = {
  magicLink: 'https://www.tersa.ai/reset-password',
  email: 'test@test.com',
} as ForgotPasswordEmailTemplateProps;

export default ForgotPasswordEmailTemplate;
