"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { ProjectCard } from "@/components/project-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useChartPin } from "@/lib/chart-pin-context"
import { CategoryPainPointsBarSimple } from "@/components/charts/category-pain-points-bar-simple"
import { getTopNegativeCategories } from "@/lib/categoryFeedback"
import {
  Plus,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Star,
  BarChart3,
  RefreshCw,
  Settings,
  Pin,
  Calendar,
} from "lucide-react"
import Link from "next/link"

// Default project data - only 2 projects allowed
const defaultProjects = [
  {
    id: "1",
    name: "Customer Pain Points Analysis",
    category: "Smart Home > Dimmer & Light Switches",
    createdAt: "2025-05-15",
    lastUpdated: "2025-05-20",
    status: "completed",
  },
]

const project2 = {
  id: "2",
  name: "Dimmer Switch Price Analysis",
  category: "Smart Home > Dimmer & Light Switches",
  createdAt: "2025-05-24",
  lastUpdated: "2025-05-24",
  status: "completed",
}

const mockCharts = [
  {
    id: "1",
    title: "Use Case Analysis",
    projectName: "Customer Pain Points Analysis",
    lastUpdated: "2025-05-20",
    autoUpdate: "weekly",
    type: "bar",
  },
  {
    id: "2",
    title: "Top 10 Critical Categories",
    projectName: "Customer Pain Points Analysis",
    lastUpdated: "2025-05-18",
    autoUpdate: "monthly",
    type: "bar",
  },
  {
    id: "3",
    title: "Competitor Pain Points Matrix",
    projectName: "Customer Pain Points Analysis",
    lastUpdated: "2025-05-19",
    autoUpdate: "weekly",
    type: "matrix",
  },
  {
    id: "4",
    title: "Feature Adoption Rates",
    projectName: "Kitchen Appliances Market Research",
    lastUpdated: "2025-05-17",
    autoUpdate: null,
    type: "bar",
  },
]

const examplePrompts = [
  { icon: TrendingUp, text: "Analyze the competitive landscape", color: "bg-blue-50 text-blue-700" },
  { icon: Users, text: "What are the top customer pain points?", color: "bg-green-50 text-green-700" },
  { icon: DollarSign, text: "Show me pricing trends in this category", color: "bg-purple-50 text-purple-700" },
  { icon: Target, text: "Identify market opportunities", color: "bg-orange-50 text-orange-700" },
  { icon: Star, text: "Compare feature preferences", color: "bg-pink-50 text-pink-700" },
  { icon: BarChart3, text: "Generate customer persona insights", color: "bg-indigo-50 text-indigo-700" },
]

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projects, setProjects] = useState(defaultProjects)
  const [currentProjectId, setCurrentProjectId] = useState("1")
  const { getPinnedCharts } = useChartPin()
  const pinnedCharts = getPinnedCharts()

  // Load projects from localStorage on mount
  useEffect(() => {
    const project2Created = localStorage.getItem('project2-created')
    const savedCurrentProject = localStorage.getItem('current-project-id')
    
    if (project2Created === 'true') {
      // Show both projects if project 2 has been created
      setProjects([...defaultProjects, project2])
    } else {
      // Only show default project
      setProjects(defaultProjects)
    }
    
    // Set current project from localStorage or default to "1"
    if (savedCurrentProject && (savedCurrentProject === "1" || (savedCurrentProject === "2" && project2Created === 'true'))) {
      setCurrentProjectId(savedCurrentProject)
    } else {
      setCurrentProjectId("1")
      localStorage.setItem('current-project-id', "1")
    }
  }, [])

  // Get the current project based on currentProjectId
  const mostRecentProject = projects.find(p => p.id === currentProjectId) || projects[0] || null

  const getChartIcon = (type: string) => {
    switch (type) {
      case "line":
        return TrendingUp
      case "pie":
        return Target
      default:
        return BarChart3
    }
  }

  // Get the tab value for a specific chart
  const getChartTab = (chartId: string) => {
    switch (chartId) {
      case "critical-categories":
        return "categories"
      case "use-case-analysis":
        return "use-cases"
      case "competitor-matrix":
        return "competitors"
      case "brand-price-distribution":
        return "brand-distribution"
      case "revenue-analysis":
        return "revenue-analysis"
      default:
        return ""
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        projects={projects}
        charts={pinnedCharts}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Xenith</h1>
            <div className="flex items-center space-x-2 text-gray-500">
              <span className="text-xs">powered by</span>
              <img 
                src="/logo-teamname-0617-scarlett.svg" 
                alt="3PO Lab" 
                className="h-3 w-auto opacity-60"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <Search className="w-4 h-4 text-gray-400" />
            </Button>
            <Link href="/onboarding">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Project
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {mostRecentProject ? (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Most Recent Project */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Current Project</h2>
                </div>

                <ProjectCard project={mostRecentProject} featured={true} />
              </div>

              {/* Subscribed Charts */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subscribed Charts</h3>
                {pinnedCharts.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pinnedCharts.map((chart) => {
                      const ChartIcon = getChartIcon(chart.type)
                      return (
                        <Card key={chart.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base line-clamp-1">
                                  {chart.id === "critical-categories" ? "Critical Categories" : chart.title}
                                </CardTitle>
                                <div className="text-xs text-gray-500">{chart.projectName}</div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                  <Pin className="w-3 h-3 text-blue-600 fill-blue-600" />
                                </Button>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                  <Settings className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            {/* Actual Chart Content */}
                            {chart.id === "critical-categories" ? (
                              <div className="mb-4">
                                <CategoryPainPointsBarSimple data={getTopNegativeCategories('dimmer', 10)} />
                              </div>
                            ) : (
                              /* Placeholder for other charts */
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-48 flex items-center justify-center mb-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/20"></div>
                                <div className="text-center text-gray-600 z-10">
                                  <ChartIcon className="w-16 h-16 mx-auto mb-3 text-blue-600" />
                                  <div className="text-sm font-medium">{chart.title}</div>
                                  <div className="text-xs text-gray-500 mt-1">Live {chart.type} visualization</div>
                                </div>
                                {/* Simulated chart elements */}
                                <div className="absolute bottom-4 left-4 right-4">
                                  <div className="flex items-end space-x-1 h-8">
                                    {[...Array(8)].map((_, i) => (
                                      <div
                                        key={i}
                                        className="bg-blue-400/60 rounded-t flex-1"
                                        style={{ height: `${Math.random() * 100 + 20}%` }}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Chart Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-2 border-t">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Updated {new Date(chart.lastUpdated).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                              {chart.autoUpdate && (
                                <Badge variant="outline" className="text-xs">
                                  <RefreshCw className="w-2 h-2 mr-1" />
                                  Auto-updates {chart.autoUpdate}
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <ChartIcon className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600 capitalize">{chart.type} Chart</span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Update
                                </Button>
                                <Link href={chart.id === "critical-categories" ? `/project/1/chat#critical-categories` : `/project/${chart.projectId}?tab=${getChartTab(chart.id)}`}>
                                  <Button variant="default" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Pin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Pinned Charts</h4>
                    <p className="text-gray-600">Pin your favorite charts from project pages to see them here.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Xenith</h2>
                  <p className="text-gray-600">
                    Start your first market research analysis to unlock powerful insights from Amazon product data.
                  </p>
                </div>

                <Link href="/onboarding">
                  <Button size="lg" className="mb-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your First Analysis
                  </Button>
                </Link>

                <div className="text-left">
                  <h3 className="font-medium text-gray-900 mb-3">What you can analyze:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Competitive landscape and market positioning</li>
                    <li>• Customer pain points and preferences</li>
                    <li>• Pricing trends and opportunities</li>
                    <li>• Product feature analysis</li>
                    <li>• Market gaps and opportunities</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
