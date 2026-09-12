import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Sparkles } from "@/components/auth/sparkle"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex relative w-1/2 flex-col items-center justify-center bg-[#1a2e1a] p-12 overflow-hidden">
        <Sparkles />

        <div className="relative z-10 flex flex-col items-center text-center">
          <Link to="/">
            <img src="/logo.svg" alt="Logo" className="mb-8 h-20 w-auto" />
          </Link>
          <h1 className="mb-4 text-4xl font-bold text-white">
            RTE Platform
          </h1>
          <p className="text-lg text-white/70">
            Empowering Education Through Technology
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#79C24B]/20 to-transparent" />
      </div>

      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-block mb-4">
              <img src="/logo.svg" alt="Logo" className="mx-auto h-14 w-auto" />
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
