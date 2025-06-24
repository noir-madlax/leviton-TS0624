"use client"

import { useState, use, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CategoryUseCaseBar from "@/components/CategoryUseCaseBar"
import { CategoryPainPointsBar } from "@/components/charts/category-pain-points-bar"
import { CompetitorMatrix } from "@/components/charts/competitor-matrix"
import { PricingAnalysis } from "@/components/pricing-analysis"
import { ScatterChart } from "@/components/charts/scatter-chart"
import { PriceTypeSelector, type PriceType } from "@/components/price-type-selector"
import { MetricTypeSelector, type MetricType } from "@/components/metric-type-selector"
import { getTopUseCases, getTopNegativeCategories } from "@/lib/categoryFeedback"
import { getCompetitorAnalysisData } from "@/lib/competitorAnalysis"
import { fetchDashboardData } from "@/lib/data"
import {
  ArrowLeft,
  Send,
  Download,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [message, setMessage] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [priceType, setPriceType] = useState<PriceType>("unit")
  const [metricType, setMetricType] = useState<MetricType>("revenue")

  // Load data based on project ID
  const projectId = resolvedParams.id
  
  // Load dashboard data for project 2
  useEffect(() => {
    if (projectId === "2") {
      setLoading(true)
      fetchDashboardData().then((data) => {
        console.log('Fetched dashboard data:', data)
        setDashboardData(data)
        setLoading(false)
      }).catch((error) => {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      })
    }
  }, [projectId])
  
  // Memoize data to prevent recalculation on every render
  const projectData = useMemo(() => {
    if (projectId === "1") {
      return {
        useCaseData: getTopUseCases('dimmer', 15),
        negativeCategories: getTopNegativeCategories('dimmer', 10),
        competitorData: getCompetitorAnalysisData()
      }
    } else if (projectId === "2") {
      return {
        dashboardData: dashboardData
      }
    }
    return {}
  }, [projectId, dashboardData])

  const handleSendMessage = () => {
    if (!message.trim()) return
    // Handle chat message
    setMessage("")
  }

  // Get project info based on ID
  const getProjectInfo = () => {
    if (projectId === "1") {
      return {
        name: "Customer Pain Points Analysis",
        category: "Smart Home > Dimmer & Light Switches"
      }
    } else if (projectId === "2") {
      return {
        name: "Dimmer Switch Price Analysis", 
        category: "Smart Home > Dimmer & Light Switches"
      }
    }
    return {
      name: "Unknown Project",
      category: "Unknown Category"
    }
  }

  const projectInfo = getProjectInfo()

  // Transform data for scatter chart based on selected price type and metric type
  const transformScatterData = (products: any[], category: string) => {
    return products.map((p) => ({
      x: priceType === "sku" ? p.price : p.unitPrice,
      y: metricType === "revenue" ? p.revenue : p.volume,
      name: p.name,
      brand: p.brand,
      volume: p.volume,
      revenue: p.revenue,
      url: p.url,
      category: category,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{projectInfo.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {projectInfo.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatOpen(!chatOpen)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projectId === "1" ? (
          // Project 1: Customer Pain Points Analysis
          <div className="grid grid-cols-1 gap-8">
            {/* Analysis Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-muted-foreground">Key Questions Answered</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">1,247</div>
                    <div className="text-sm text-muted-foreground">Reviews Analyzed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-muted-foreground">Product Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Analysis */}
            <Tabs defaultValue="use-cases" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="use-cases">Use Case Analysis</TabsTrigger>
                <TabsTrigger value="categories">Critical Categories</TabsTrigger>
                <TabsTrigger value="competitors">Competitor Matrix</TabsTrigger>
              </TabsList>

              <TabsContent value="use-cases" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What use cases do customers complain about the most?</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Use Case Analysis filtered by top negative review count
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CategoryUseCaseBar data={projectData.useCaseData as any || []} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 Most Critical Categories by Negative Reviews Count</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Product features with highest customer complaints
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CategoryPainPointsBar data={projectData.negativeCategories || []} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Delights and Pain Points Matrix</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Analysis for Leviton D215S, Leviton DSL06, Lutron Caseta Diva
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CompetitorMatrix 
                      data={projectData.competitorData?.matrixData || []} 
                      targetProducts={projectData.competitorData?.targetProducts || []} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : projectId === "2" ? (
          // Project 2: Dimmer Switch Price Analysis
          <div className="grid grid-cols-1 gap-8">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-lg">Loading pricing analysis data...</div>
                  <div className="text-sm text-muted-foreground mt-2">Please wait while we fetch the data</div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Analysis Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Price Analysis Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">288</div>
                        <div className="text-sm text-muted-foreground">Products Analyzed</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">59</div>
                        <div className="text-sm text-muted-foreground">Brands Compared</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">$32.37</div>
                        <div className="text-sm text-muted-foreground">Average Price</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Analysis */}
                <Tabs defaultValue="brand-distribution" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="brand-distribution">Brand Price Distribution</TabsTrigger>
                    <TabsTrigger value="revenue-analysis">Revenue Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="brand-distribution" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Brand Price Distribution by Category</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Price ranges and positioning of different brands in dimmer and light switch categories
                        </p>
                      </CardHeader>
                      <CardContent>
                        <PricingAnalysis 
                          data={projectData.dashboardData?.pricingAnalysis}
                          productAnalysis={projectData.dashboardData?.productAnalysis}
                          productLists={projectData.dashboardData?.productLists}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="revenue-analysis" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top 20 Products by Revenue (Price vs Revenue by Category)</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          How well products of different prices are selling in the market
                        </p>
                      </CardHeader>
                      <CardContent>
                        {projectData.dashboardData?.productAnalysis ? (
                          <div className="space-y-4">
                            <div className="flex gap-4 mb-4">
                              <PriceTypeSelector onChange={setPriceType} />
                              <MetricTypeSelector onChange={setMetricType} value={metricType} />
                            </div>
                            <div className="h-[800px]">
                              <ScatterChart
                                dimmerData={transformScatterData(
                                  projectData.dashboardData.productAnalysis.priceVsRevenue
                                    .find((cat: any) => cat.category === "Dimmer Switches")?.products || [],
                                  "🔆 Dimmer Switches"
                                )}
                                switchData={transformScatterData(
                                  projectData.dashboardData.productAnalysis.priceVsRevenue
                                    .find((cat: any) => cat.category === "Light Switches")?.products || [],
                                  "💡 Light Switches"
                                )}
                                xAxisLabel="Price (USD)"
                                yAxisLabel={metricType === "revenue" ? "Revenue (USD)" : "Volume (Units)"}
                                priceType={priceType}
                                metricType={metricType}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Revenue analysis data is loading...
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        ) : (
          // Unknown project
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600">Project Not Found</h2>
            <p className="text-gray-500 mt-2">The requested project does not exist.</p>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">AI Assistant</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatOpen(false)}
            >
              ×
            </Button>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-4 mb-4">
              <div className="text-sm text-muted-foreground">
                Ask questions about your analysis or request additional insights.
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium">AI Assistant</div>
                <div className="text-sm mt-1">
                  {projectId === "1" 
                    ? "Hello! I can help you analyze your customer pain points data. What would you like to know?"
                    : "Hello! I can help you analyze your pricing data and competitive positioning. What would you like to know?"
                  }
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your data..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
