import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  titleClassName?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  titleClassName,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-end overflow-hidden bg-[#FCFBFA]">
      {/* Background Image */}
      <img
        src="/common/Login-Background.jpg"
        alt="Login background"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Centered Logo in Sky Area (Circled Region) */}
      <div className="absolute top-[22%] left-1/4 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block select-none pointer-events-none">
        <img
          src="/logo.svg"
          alt="Logo"
          className="h-20 w-auto drop-shadow-lg"
        />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <img
              src="/logo.svg"
              alt="Logo"
              className="mx-auto h-14 w-auto drop-shadow-sm"
            />
          </div>

          <div className="mb-8">
            <h2
              className={cn(
                'text-3xl font-bold text-gray-900 font-title',
                titleClassName,
              )}
            >
              {title}
            </h2>
            <p className="mt-2 text-gray-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
