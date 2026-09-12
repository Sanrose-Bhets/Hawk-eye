import { useState } from "react"
import { Search } from "lucide-react"
import { DUMMY_STUDENTS } from "@/lib/api/seat-plan"
import type { DummyStudent } from "@/lib/types"

interface StudentSearchProps {
  onSelect: (student: DummyStudent) => void
  selectedIds?: string[]
  disabledIds?: string[]
  disabledLabel?: string
  multi?: boolean
  onToggle?: (student: DummyStudent) => void
}

export function StudentSearch({ onSelect, selectedIds = [], disabledIds = [], disabledLabel = "Assigned", multi, onToggle }: StudentSearchProps) {
  const [query, setQuery] = useState("")

  const filtered = DUMMY_STUDENTS.filter((s) => {
    const q = query.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring transition-colors"
        />
      </div>

      <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">No students found</div>
        ) : (
          filtered.map((student) => {
            const isSelected = selectedIds.includes(student.id)
            const isDisabled = disabledIds.includes(student.id)
            return (
              <button
                key={student.id}
                onClick={() => {
                  if (isDisabled) return
                  if (multi && onToggle ? onToggle(student) : onSelect(student))
                }}
                disabled={isDisabled}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                    : isSelected
                      ? "bg-primary-light text-primary cursor-pointer"
                      : "hover:bg-gray-50 text-gray-700 cursor-pointer"
                }`}
              >
                {multi && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    disabled={isDisabled}
                    className="h-4 w-4 rounded border-gray-300 accent-primary"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-xs text-gray-500">{student.email}</div>
                </div>
                {isDisabled && (
                  <span className="text-xs text-gray-400 shrink-0">{disabledLabel}</span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
