import { Link } from 'react-router-dom';
import { Shield, GraduationCap, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const roles = [
  {
    title: 'RTE',
    description: 'Right to Education administration and management',
    icon: Shield,
    path: '/login/rte',
  },
  {
    title: 'Student Service',
    description: 'Student services and support management',
    icon: Headphones,
    path: '/login/student-service',
  },
  {
    title: 'Student',
    description: 'Student portal for learning and resources',
    icon: GraduationCap,
    path: '/login/student',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="mb-10 text-center">
        <Link to="/" className="inline-block mb-4">
          <img src="/logo.svg" alt="Logo" className="mx-auto h-16 w-auto" />
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
        <p className="mt-2 text-lg text-gray-500">
          Select your role to sign in
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4">
        {roles.map((role) => (
          <Card
            key={role.path}
            className="group transition-all duration-200 hover:shadow-xl hover:border-primary/30"
          >
            <CardContent>
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <role.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
                <Link to={role.path}>
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
