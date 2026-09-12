import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function StudentServiceLogin() {
  return (
    <AuthLayout
      title="Student Service Login"
      titleClassName="text-3xl sm:text-4xl lg:text-[56px] leading-tight"
      subtitle="Sign in to the Student Service portal"
    >
      <LoginForm />
    </AuthLayout>
  );
}
