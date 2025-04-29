import { LoginForm } from './components/login-form';

const title = 'Login';
const description = 'Welcome back. Login to your account to continue.';

export const metadata = {
  title,
  description,
};

const LoginPage = () => <LoginForm />;

export default LoginPage;
