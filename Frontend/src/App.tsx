import { Routes, Route } from "react-router-dom"
import Home from "@/pages/home"
import RteLogin from "@/pages/login/rte-login"
import StudentServiceLogin from "@/pages/login/student-service-login"
import StudentLogin from "@/pages/login/student-login"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/rte" element={<RteLogin />} />
      <Route path="/login/student-service" element={<StudentServiceLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />
    </Routes>
  )
}

export default App
