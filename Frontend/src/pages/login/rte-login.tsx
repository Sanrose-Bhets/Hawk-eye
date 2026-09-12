import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function RteLogin() {
  return (
    <AuthLayout
      title="RTE Login"
      titleClassName="text-3xl sm:text-4xl lg:text-[56px] leading-tight"
      subtitle="Sign in to the Right to Education portal"
    >
      <LoginForm />
    </AuthLayout>
  );
}
