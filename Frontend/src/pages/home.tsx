import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const roles = [
  {
    title: 'RTE Portal',
    description: 'Right to Education administration and seating management',
    path: '/login/rte',
  },
  {
    title: 'Student Service',
    description:
      'Student services, module coordination, and support management',
    path: '/login/student-service',
  },
  {
    title: 'Student Portal',
    description: 'Access exam seat allocations, results, and study resources',
    path: '/login/student',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/70 py-12 px-6">
      <div className="mb-12 text-center max-w-lg">
        <Link to="/" className="inline-block mb-5">
          <img src="/logo.svg" alt="Logo" className="mx-auto h-16 w-auto" />
        </Link>
        <h1 className="text-[56px] font-bold text-gray-900 tracking-tight leading-tight">
          Welcome
        </h1>
        <p className="mt-2.5 text-base text-gray-500">
          Select your portal to sign in to your dashboard
        </p>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {roles.map((role) => (
          <Link
            key={role.path}
            to={role.path}
            className="group relative flex flex-col justify-between rounded-[8px] border border-gray-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl cursor-pointer"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-primary">
                {role.title}
              </h3>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {role.description}
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-primary transition-colors group-hover:text-primary-hover">
              <span>Sign In</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
