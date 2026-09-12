import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const roles = [
  {
    title: 'RTE PORTAL',
    path: '/login/rte',
    iconSrc: '/common/portal-icon-1.png',
    hoverArrowClass: 'group-hover:text-[#A0001C]',
  },
  {
    title: 'STUDENT SERVICE',
    path: '/login/student-service',
    iconSrc: '/common/portal-icon-2.png',
    hoverArrowClass: 'group-hover:text-[#FFC423]',
  },
  {
    title: 'STUDENT PORTAL',
    path: '/login/student',
    iconSrc: '/common/portal-icon-3.png',
    hoverArrowClass: 'group-hover:text-[#060077]',
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden pt-24 md:pt-36 pb-20 px-6">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/common/home-background.jpg"
        className="absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none scale-[1.35] origin-center"
      >
        <source src="/video/home-background.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Header */}
        <div className="mb-18 md:mb-24 text-center max-w-lg">
          <Link to="/" className="inline-block mb-3.5">
            <img
              src="/logo.svg"
              alt="Logo"
              className="mx-auto h-16 w-auto drop-shadow-sm transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <h1 className="text-[72px] font-bold text-white tracking-tight leading-tight font-title drop-shadow-md">
            Welcome
          </h1>
          <p className="mt-2 text-base font-medium text-white/90 drop-shadow-sm">
            Select your portal to sign in to your dashboard
          </p>
        </div>

        {/* Stacked Horizontal Portal Cards */}
        <div className="flex w-full max-w-3xl flex-col gap-6 md:gap-7">
          {roles.map((role) => (
            <Link
              key={role.path}
              to={role.path}
              className="group flex items-center justify-between rounded-[16px] border border-white/35 bg-white/15 px-8 py-[21px] shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.5)] backdrop-blur-[3px] transition-all duration-300 cursor-pointer text-white md:px-10 md:py-[25px]"
            >
              <div className="flex items-center gap-5 md:gap-6">
                <img
                  src={role.iconSrc}
                  alt={role.title}
                  className="h-[48px] w-[48px] md:h-[56px] md:w-[56px] shrink-0 object-contain drop-shadow-xs"
                />
                <span className="text-xl md:text-2xl font-bold tracking-wider font-title uppercase text-white drop-shadow-sm">
                  {role.title}
                </span>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center text-white drop-shadow-sm transition-colors duration-300 ${role.hoverArrowClass}`}
              >
                <ArrowRight size={28} strokeWidth={2.5} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
