"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type IntervalSelectorProps = {
  value: string
  onChange: (value: string) => void
}

const intervals = [
  { value: "1h", label: "1小时" },
  { value: "4h", label: "4小时" },
  { value: "1d", label: "1天" },
]

export function IntervalSelector({ value, onChange }: IntervalSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {intervals.map((interval) => (
          <SelectItem key={interval.value} value={interval.value}>
            {interval.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
