"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ChartData {
  id: string
  title: string
  projectName: string
  projectId: string
  lastUpdated: string
  autoUpdate: string | null
  type: string
  isPinned: boolean
  data?: any
}

interface ChartPinContextType {
  pinnedCharts: ChartData[]
  togglePin: (chart: ChartData) => void
  isChartPinned: (chartId: string) => boolean
  getPinnedCharts: () => ChartData[]
  resetPins: () => void
}

const ChartPinContext = createContext<ChartPinContextType | undefined>(undefined)

const STORAGE_KEY = 'xenith-pinned-charts'

export function ChartPinProvider({ children }: { children: ReactNode }) {
  const [pinnedCharts, setPinnedCharts] = useState<ChartData[]>([])

  // Load pinned charts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsedCharts = JSON.parse(saved)
        // Update any charts with old dates to new dates
        const updatedCharts = parsedCharts.map((chart: ChartData) => {
          if (chart.id === "critical-categories") {
            return {
              ...chart,
              title: "Category Pain Points Trend Analysis",
              autoUpdate: "monthly",
              type: "line",
              lastUpdated: chart.lastUpdated === "2024-01-20" || chart.lastUpdated?.includes("2024-01-20") ? "2025-05-20" : chart.lastUpdated,
            }
          }
          return chart
        })
        setPinnedCharts(updatedCharts)
        // Save the updated charts back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharts))
      } catch (error) {
        console.error('Error loading pinned charts:', error)
      }
    } else {
      // Set default pinned chart - "Category Pain Points Trend Over Time"
      const defaultPinnedChart: ChartData = {
        id: "category-trend-analysis",
        title: "Category Pain Points Trend Over Time",
        projectName: "Customer Pain Points Analysis",
        projectId: "1",
        lastUpdated: "2025-05-29",
        autoUpdate: "weekly",
        type: "line",
        isPinned: true
      }
      setPinnedCharts([defaultPinnedChart])
      localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultPinnedChart]))
    }
  }, [])

  const togglePin = (chart: ChartData) => {
    setPinnedCharts(prev => {
      const isCurrentlyPinned = prev.some(c => c.id === chart.id)
      let newPinnedCharts: ChartData[]
      
      if (isCurrentlyPinned) {
        // Unpin the chart
        newPinnedCharts = prev.filter(c => c.id !== chart.id)
      } else {
        // Pin the chart
        newPinnedCharts = [...prev, { ...chart, isPinned: true }]
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPinnedCharts))
      return newPinnedCharts
    })
  }

  const isChartPinned = (chartId: string) => {
    return pinnedCharts.some(chart => chart.id === chartId)
  }

  const getPinnedCharts = () => {
    return pinnedCharts
  }

  const resetPins = () => {
    // Reset to default pinned chart only
    const defaultPinnedChart: ChartData = {
      id: "category-trend-analysis",
      title: "Category Pain Points Trend Over Time",
      projectName: "Customer Pain Points Analysis",
      projectId: "1",
      lastUpdated: "2025-05-29",
      autoUpdate: "weekly",
      type: "line",
      isPinned: true
    }
    setPinnedCharts([defaultPinnedChart])
    localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultPinnedChart]))
    
    // Also reset project flags and current project
    localStorage.removeItem('project2-created')
    localStorage.removeItem('project2-in-progress')
    localStorage.setItem('current-project-id', '1')
  }

  return (
    <ChartPinContext.Provider value={{ pinnedCharts, togglePin, isChartPinned, getPinnedCharts, resetPins }}>
      {children}
    </ChartPinContext.Provider>
  )
}

export function useChartPin() {
  const context = useContext(ChartPinContext)
  if (context === undefined) {
    throw new Error('useChartPin must be used within a ChartPinProvider')
  }
  return context
} 