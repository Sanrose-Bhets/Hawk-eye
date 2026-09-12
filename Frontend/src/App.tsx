import { Routes, Route } from "react-router-dom"
import Home from "@/pages/home"
import RteLogin from "@/pages/login/rte-login"
import StudentServiceLogin from "@/pages/login/student-service-login"
import StudentLogin from "@/pages/login/student-login"
import RteDashboard from "@/pages/dashboard/rte-dashboard"
import FloorPlansPage from "@/pages/dashboard/seat-plan/floor-plans"
import CreateFloorPlanPage from "@/pages/dashboard/seat-plan/create-floor-plan"
import EditFloorPlanPage from "@/pages/dashboard/seat-plan/edit-floor-plan"
import ClassesPage from "@/pages/dashboard/seat-plan/classes"
import CreateClassPage from "@/pages/dashboard/seat-plan/create-class"
import ClassDetailPage from "@/pages/dashboard/seat-plan/class-detail"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/rte" element={<RteLogin />} />
      <Route path="/login/student-service" element={<StudentServiceLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />

      <Route path="/dashboard/rte" element={<RteDashboard />}>
        <Route index element={<FloorPlansPage />} />
        <Route path="floor-plans" element={<FloorPlansPage />} />
        <Route path="floor-plans/new" element={<CreateFloorPlanPage />} />
        <Route path="floor-plans/:id/edit" element={<EditFloorPlanPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/new" element={<CreateClassPage />} />
        <Route path="classes/:id" element={<ClassDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App
