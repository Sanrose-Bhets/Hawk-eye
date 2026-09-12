import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/userSlice';

export function useDashboardBase(): string {
  const user = useSelector(selectCurrentUser);
  return user?.role === 'STUDENT_SERVICE'
    ? '/dashboard/student-service'
    : '/dashboard/rte';
}
