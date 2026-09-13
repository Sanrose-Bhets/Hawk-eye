import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/context/sidebar-context';
import Home from '@/pages/home';
import RteLogin from '@/pages/login/rte-login';
import StudentServiceLogin from '@/pages/login/student-service-login';
import StudentLogin from '@/pages/login/student-login';

const RteDashboard = lazy(() => import('@/pages/dashboard/rte-dashboard'));
const StudentServiceDashboard = lazy(
  () => import('@/pages/dashboard/student-service-dashboard'),
);
const StudentDashboard = lazy(
  () => import('@/pages/dashboard/student-dashboard'),
);

const StudentServiceOverview = lazy(
  () => import('@/pages/dashboard/student-service/overview'),
);
const StudentsPage = lazy(
  () => import('@/pages/dashboard/student-service/students'),
);
const ModulesPage = lazy(
  () => import('@/pages/dashboard/student-service/modules'),
);
const ResultsPage = lazy(
  () => import('@/pages/dashboard/student-service/results'),
);
const MailManagementPage = lazy(
  () => import('@/pages/dashboard/student-service/mail'),
);
const TeachersPage = lazy(
  () => import('@/pages/dashboard/student-service/teachers'),
);

const FloorPlansPage = lazy(
  () => import('@/pages/dashboard/seat-plan/floor-plans'),
);
const CreateFloorPlanPage = lazy(
  () => import('@/pages/dashboard/seat-plan/create-floor-plan'),
);
const EditFloorPlanPage = lazy(
  () => import('@/pages/dashboard/seat-plan/edit-floor-plan'),
);
const ClassesPage = lazy(() => import('@/pages/dashboard/seat-plan/classes'));
const CreateClassPage = lazy(
  () => import('@/pages/dashboard/seat-plan/create-class'),
);
const ClassDetailPage = lazy(
  () => import('@/pages/dashboard/seat-plan/class-detail'),
);

const StudentOverview = lazy(
  () => import('@/pages/dashboard/student/overview'),
);
const StudentResultsPage = lazy(
  () => import('@/pages/dashboard/student/results'),
);
const StudentModulesPage = lazy(
  () => import('@/pages/dashboard/student/modules'),
);
const StudentSeatingPage = lazy(
  () => import('@/pages/dashboard/student/seating'),
);
const TodaysExamPage = lazy(
  () => import('@/pages/dashboard/student/todays-exam'),
);
const UpcomingExamsPage = lazy(
  () => import('@/pages/dashboard/student/upcoming-exams'),
);
const StudentProfilePage = lazy(
  () => import('@/pages/dashboard/student/profile'),
);
const StudentAnalyticsPage = lazy(
  () => import('@/pages/dashboard/student/analytics'),
);
const StudentAdmitCardPage = lazy(
  () => import('@/pages/dashboard/student/admit-card'),
);

const CalendarPage = lazy(() => import('@/pages/dashboard/calendar'));
const ExamRoutinesPage = lazy(() => import('@/pages/dashboard/exam-routines'));
const AdmitCardsPage = lazy(() => import('@/pages/dashboard/admit-cards'));
const ClassBookingsPage = lazy(
  () => import('@/pages/dashboard/class-bookings'),
);
const BackupPage = lazy(() => import('@/pages/dashboard/backup'));

function Spinner() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <SidebarProvider>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/rte" element={<RteLogin />} />
          <Route
            path="/login/student-service"
            element={<StudentServiceLogin />}
          />
          <Route path="/login/student" element={<StudentLogin />} />

          {/* RTE Portal Routes */}
          <Route path="/dashboard/rte" element={<RteDashboard />}>
            <Route index element={<FloorPlansPage />} />
            <Route path="floor-plans" element={<FloorPlansPage />} />
            <Route path="floor-plans/new" element={<CreateFloorPlanPage />} />
            <Route
              path="floor-plans/:id/edit"
              element={<EditFloorPlanPage />}
            />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/new" element={<CreateClassPage />} />
            <Route path="classes/:id" element={<ClassDetailPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="exam-routines" element={<ExamRoutinesPage />} />
            <Route path="admit-cards" element={<AdmitCardsPage />} />
            <Route path="backup" element={<BackupPage />} />
          </Route>

          {/* Student Service Portal Routes */}
          <Route
            path="/dashboard/student-service"
            element={<StudentServiceDashboard />}
          >
            <Route index element={<StudentServiceOverview />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="mail" element={<MailManagementPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/new" element={<CreateClassPage />} />
            <Route path="classes/:id" element={<ClassDetailPage />} />
            <Route path="class-bookings" element={<ClassBookingsPage />} />
            <Route path="backup" element={<BackupPage />} />
          </Route>

          {/* Student Portal Routes */}
          <Route path="/dashboard/student" element={<StudentDashboard />}>
            <Route index element={<StudentOverview />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="results" element={<StudentResultsPage />} />
            <Route path="analytics" element={<StudentAnalyticsPage />} />
            <Route path="modules" element={<StudentModulesPage />} />
            <Route path="seating" element={<StudentSeatingPage />} />
            <Route path="examination/today" element={<TodaysExamPage />} />
            <Route
              path="examination/seating"
              element={<StudentSeatingPage />}
            />
            <Route
              path="examination/upcoming"
              element={<UpcomingExamsPage />}
            />
            <Route
              path="examination/admit-card"
              element={<StudentAdmitCardPage />}
            />
          </Route>
        </Routes>
      </Suspense>
    </SidebarProvider>
  );
}

export default App;
