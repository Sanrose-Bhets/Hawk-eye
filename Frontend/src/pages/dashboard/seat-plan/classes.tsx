import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Eye, Trash2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { classApi } from "@/lib/api/seat-plan"
import type { ClassData } from "@/lib/types"

export default function ClassesPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classApi.list().then((r) => {
      setClasses(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class?")) return
    await classApi.delete(id)
    setClasses(classes.filter((c) => c.id !== id))
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage class seat assignments</p>
        </div>
        <Button onClick={() => navigate("/dashboard/rte/classes/new")}>
          <Plus size={18} className="mr-2" />
          New Class
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <GraduationCap size={32} className="text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">No classes yet</p>
            <p className="text-sm text-gray-500 mb-5">Create a class to start assigning seats</p>
            <Button onClick={() => navigate("/dashboard/rte/classes/new")}>
              <Plus size={18} className="mr-2" />
              New Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {cls.assignments.length} student{cls.assignments.length !== 1 ? "s" : ""} assigned
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/rte/classes/${cls.id}`)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cls.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                {cls.assignments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cls.assignments.slice(0, 5).map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600"
                      >
                        <span className="font-medium">{a.studentName.split(" ")[0]}</span>
                      </span>
                    ))}
                    {cls.assignments.length > 5 && (
                      <span className="inline-flex items-center px-2 text-xs text-gray-400">
                        +{cls.assignments.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
