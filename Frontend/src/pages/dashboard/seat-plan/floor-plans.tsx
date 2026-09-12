import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { floorPlanApi } from "@/lib/api/seat-plan"
import type { FloorPlan } from "@/lib/types"

export default function FloorPlansPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<FloorPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    floorPlanApi.list().then((r) => {
      setPlans(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this floor plan?")) return
    await floorPlanApi.delete(id)
    setPlans(plans.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Floor Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage reusable seat layouts</p>
        </div>
        <Button onClick={() => navigate("/dashboard/rte/floor-plans/new")}>
          <Plus size={18} className="mr-2" />
          New Floor Plan
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <LayoutGrid size={32} className="text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">No floor plans yet</p>
            <p className="text-sm text-gray-500 mb-5">Create a floor plan to start designing seat layouts</p>
            <Button onClick={() => navigate("/dashboard/rte/floor-plans/new")}>
              <Plus size={18} className="mr-2" />
              New Floor Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {plan.seats.length} seat{plan.seats.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/rte/floor-plans/${plan.id}/edit`)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {plan.seats.slice(0, 8).map((seat, i) => (
                    <span
                      key={i}
                      className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-600"
                    >
                      {seat.label}
                    </span>
                  ))}
                  {plan.seats.length > 8 && (
                    <span className="inline-flex h-7 items-center px-2 text-xs text-gray-400">
                      +{plan.seats.length - 8} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
