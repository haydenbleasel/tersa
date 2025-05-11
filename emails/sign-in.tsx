import { Head, Hr, Html, Link, Preview, Text } from '@react-email/components';
import { EmailLayout } from './layout';

type LoginEmailTemplateProps = {
  magicLink: string;
  email: string;
};

export const LoginEmailTemplate = ({
  magicLink,
  email,
}: LoginEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Your magic link to login to Tersa</Preview>
    <EmailLayout>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        Hello there! Someone (hopefully you) requested to login to Tersa.
      </Text>
      <Text className="text-left text-[#525f7f] text-base leading-6">
        Click the button below to securely login to your Tersa account. No
        password needed!
      </Text>
      <Link
        className="block w-full rounded-md bg-[#009869] py-2.5 text-center font-bold text-base text-white no-underline"
        href={magicLink}
      >
        Login to Tersa
      </Link>
      <Hr className="my-5 border-[#e6ebf1]" />
      <Text className="text-left text-[#525f7f] text-base leading-6">
        This magic link will expire in 10 minutes. If you didn't request to
        login, you can safely ignore this email.
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

LoginEmailTemplate.PreviewProps = {
  magicLink: 'https://www.tersa.ai/login',
  email: 'test@test.com',
} as LoginEmailTemplateProps;

export default LoginEmailTemplate;
