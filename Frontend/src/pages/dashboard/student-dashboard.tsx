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
    <div className="flex h-screen bg-white text-neutral-900 font-sans antialiased">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        <Outlet />
      </main>
    </div>
  );
}
