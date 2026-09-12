import { Navigate, Outlet } from "react-router-dom"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function RteDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null")

  if (!user || user.role !== "RTE") {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
