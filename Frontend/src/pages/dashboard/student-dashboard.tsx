import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StudentSidebar } from '@/components/dashboard/student-sidebar';
import { selectCurrentUser } from '@/redux/userSlice';

export default function StudentDashboard() {
  const user = useSelector(selectCurrentUser);

  if (!user || user.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="relative flex h-screen bg-[#f8fafc] text-neutral-900 antialiased overflow-hidden select-none"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* iOS 26 Optical Ambient Mesh Lighting (Apple SwiftUI style - Lime & Emerald Green) */}
      <div className="absolute top-[-10%] right-[-5%] w-[48rem] h-[48rem] rounded-full bg-gradient-to-br from-emerald-400/28 via-lime-300/20 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[52rem] h-[52rem] rounded-full bg-gradient-to-tr from-emerald-400/25 via-lime-300/18 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[15%] w-[42rem] h-[42rem] rounded-full bg-gradient-to-r from-emerald-300/25 via-teal-300/16 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[36rem] h-[36rem] rounded-full bg-gradient-to-tl from-lime-300/22 via-emerald-200/18 to-transparent blur-[110px] pointer-events-none" />

      {/* Sidebar with Glassmorphism */}
      <StudentSidebar />

      {/* Main Glass Canvas */}
      <main className="relative flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 z-10">
        <Outlet />
      </main>
    </div>
  );
}
