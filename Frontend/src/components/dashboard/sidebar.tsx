import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { LayoutGrid, GraduationCap, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearCredentials } from "@/redux/userSlice"

const links = [
  { to: "/dashboard/rte/floor-plans", label: "Floor Plans", icon: LayoutGrid },
  { to: "/dashboard/rte/classes", label: "Classes", icon: GraduationCap },
]

export function Sidebar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(clearCredentials())
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    navigate("/")
  }

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
          S
        </div>
        <span className="text-lg font-semibold text-gray-900">Seat Plan</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  )
}
