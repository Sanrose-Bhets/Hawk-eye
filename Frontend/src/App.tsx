import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/home';
import RteLogin from '@/pages/login/rte-login';
import StudentServiceLogin from '@/pages/login/student-service-login';
import StudentLogin from '@/pages/login/student-login';
import RteDashboard from '@/pages/dashboard/rte-dashboard';
import StudentServiceDashboard from '@/pages/dashboard/student-service-dashboard';
import StudentServiceOverview from '@/pages/dashboard/student-service/overview';
import StudentsPage from '@/pages/dashboard/student-service/students';
import ModulesPage from '@/pages/dashboard/student-service/modules';
import ResultsPage from '@/pages/dashboard/student-service/results';
import MailManagementPage from '@/pages/dashboard/student-service/mail';
import FloorPlansPage from '@/pages/dashboard/seat-plan/floor-plans';
import CreateFloorPlanPage from '@/pages/dashboard/seat-plan/create-floor-plan';
import EditFloorPlanPage from '@/pages/dashboard/seat-plan/edit-floor-plan';
import ClassesPage from '@/pages/dashboard/seat-plan/classes';
import CreateClassPage from '@/pages/dashboard/seat-plan/create-class';
import ClassDetailPage from '@/pages/dashboard/seat-plan/class-detail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/rte" element={<RteLogin />} />
      <Route path="/login/student-service" element={<StudentServiceLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />

      {/* RTE Portal Routes */}
      <Route path="/dashboard/rte" element={<RteDashboard />}>
        <Route index element={<FloorPlansPage />} />
        <Route path="floor-plans" element={<FloorPlansPage />} />
        <Route path="floor-plans/new" element={<CreateFloorPlanPage />} />
        <Route path="floor-plans/:id/edit" element={<EditFloorPlanPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/new" element={<CreateClassPage />} />
        <Route path="classes/:id" element={<ClassDetailPage />} />
        <Route path="results" element={<ResultsPage />} />
      </Route>

      {/* Student Service Portal Routes */}
      <Route
        path="/dashboard/student-service"
        element={<StudentServiceDashboard />}
      >
        <Route index element={<StudentServiceOverview />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="modules" element={<ModulesPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="mail" element={<MailManagementPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/new" element={<CreateClassPage />} />
        <Route path="classes/:id" element={<ClassDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
