"use client"

import { Button } from "@/components/ui/button"
import { Pin, PinOff } from "lucide-react"
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    togglePin(chart)
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`w-8 h-8 p-0 ${className}`}
      onClick={handleClick}
      title={isPinned ? "Unpin chart" : "Pin chart"}
    >
      {isPinned ? (
        <Pin className="w-3 h-3 text-blue-600 fill-blue-600" />
      ) : (
        <PinOff className="w-3 h-3 text-gray-400 hover:text-gray-600" />
      )}
    </Button>
  )
} 