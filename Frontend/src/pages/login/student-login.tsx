import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function StudentLogin() {
  return (
    <AuthLayout
      title="Student Login"
      titleClassName="text-3xl sm:text-4xl lg:text-[56px] leading-tight"
      subtitle="Sign in to the Student portal"
    >
      <LoginForm />
    </AuthLayout>
  );
}
