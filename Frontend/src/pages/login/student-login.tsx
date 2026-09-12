import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function StudentLogin() {
  return (
    <AuthLayout
      title="Student Login"
      subtitle="Sign in to the Student portal"
    >
      <LoginForm />
    </AuthLayout>
  )
}
