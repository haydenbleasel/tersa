import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const title = 'Thank you for signing up!';
const description = 'Check your email to confirm';

export const metadata = {
  title,
  description,
};

const SignUpSuccessPage = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm">
        You&apos;ve successfully signed up. Please check your email to confirm
        your account before signing in. Remember to check your spam folder if
        you don&apos;t see the email.
      </p>
    </CardContent>
  </Card>
);

export default SignUpSuccessPage;
