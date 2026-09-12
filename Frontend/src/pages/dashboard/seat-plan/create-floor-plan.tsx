import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SeatCanvas } from "@/components/seat-plan/seat-canvas"
import { floorPlanApi } from "@/lib/api/seat-plan"
import type { SeatPosition } from "@/lib/types"

export default function CreateFloorPlanPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [seats, setSeats] = useState<SeatPosition[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a floor plan name")
      return
    }
    if (seats.length === 0) {
      setError("Please add at least one seat")
      return
    }

    setSaving(true)
    setError("")
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      await floorPlanApi.create({
        name: name.trim(),
        seats,
        createdBy: user.id || "unknown",
      })
      navigate("/dashboard/rte/floor-plans")
    } catch {
      setError("Failed to save floor plan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard/rte/floor-plans")}
        className="mb-4 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Floor Plans
      </Button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Floor Plan</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Plan Details</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="planName" required>Floor Plan Name</Label>
            <Input
              id="planName"
              placeholder="e.g. Room 101 Layout"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Seat Layout</h2>
            <span className="text-sm text-gray-500">{seats.length} seat{seats.length !== 1 ? "s" : ""}</span>
          </div>
        </CardHeader>
        <CardContent>
          <SeatCanvas seats={seats} onChange={setSeats} />
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Floor Plan"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/dashboard/rte/floor-plans")}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
