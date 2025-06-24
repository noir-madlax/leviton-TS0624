"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useChartPin } from "@/lib/chart-pin-context"

interface ChartData {
  id: string
  title: string
  projectName: string
  projectId: string
  lastUpdated: string
  autoUpdate: string | null
  type: string
  isPinned?: boolean
  data?: any
}

interface PinButtonProps {
  chart: ChartData
  className?: string
}

export function PinButton({ chart, className = "" }: PinButtonProps) {
  const { togglePin, isChartPinned } = useChartPin()
  const isPinned = isChartPinned(chart.id)

  const handleClick = (checked: boolean) => {
    togglePin(chart)
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch
        checked={isPinned}
        onCheckedChange={handleClick}
        className="data-[state=checked]:bg-green-500"
      />
      <span className="text-xs text-gray-600">
        {isPinned ? "Subscribed" : "Unsubscribed"}
      </span>
    </div>
  )
} 