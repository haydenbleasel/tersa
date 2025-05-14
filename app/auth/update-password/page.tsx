import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UpdatePasswordForm } from './components/update-password-form';

const title = 'Update Password';
const description = 'Please enter your new password below.';

export const metadata = {
  title,
  description,
};

const LoginPage = () => (
  <Card className="gap-0 overflow-hidden bg-secondary p-0">
    <CardHeader className="bg-background py-8">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="bg-background pb-8">
      <UpdatePasswordForm />
    </CardContent>
  </Card>
);

export default LoginPage;
