"use client"

import { useState, use, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CategoryUseCaseBar from "@/components/CategoryUseCaseBar"
import { CategoryPainPointsBar } from "@/components/charts/category-pain-points-bar"
import { CompetitorMatrix } from "@/components/charts/competitor-matrix"
import { PricingAnalysis } from "@/components/pricing-analysis"
import { ScatterChart } from "@/components/charts/scatter-chart"
import { PriceTypeSelector, type PriceType } from "@/components/price-type-selector"
import { MetricTypeSelector, type MetricType } from "@/components/metric-type-selector"
import { PinButton } from "@/components/ui/pin-button"
import { getTopUseCases, getTopNegativeCategories } from "@/lib/categoryFeedback"
import { getCompetitorAnalysisData } from "@/lib/competitorAnalysis"
import { fetchDashboardData } from "@/lib/data"
import { allReviewData } from "@/lib/reviewData"
import {
  ArrowLeft,
  Download,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { ReviewPanel } from "@/components/ui/review-panel"
import { useReviewPanel } from "@/lib/review-panel-context"

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [priceType, setPriceType] = useState<PriceType>("unit")
  const [metricType, setMetricType] = useState<MetricType>("revenue")
  const [activeTab, setActiveTab] = useState<string>("")
  
  // Load data based on project ID
  const projectId = resolvedParams.id
  
  // Get tab from URL params and set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    } else {
      // Set default tabs for each project
      if (projectId === "1") {
        setActiveTab("use-cases")
      } else if (projectId === "2") {
        setActiveTab("brand-distribution")
      }
    }
  }, [projectId])

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

  // Generate real matrix data for competitor analysis (Project 1)
  const realCompetitorMatrixData = useMemo(() => {
    if (projectId !== "1" || !projectData.competitorData) return []

    const { targetProducts } = projectData.competitorData as any
    const categories: string[] = [
      ...new Set<string>(
        ((projectData.competitorData as any).matrixData.map((item: any) => item.category as string) as string[])
      ),
    ]

    // Map product names to ASINs
    const productToAsin: Record<string, string> = {
      'Leviton D26HD': 'B0BVKYKKRK',
      'Leviton D215S': 'B0BVKZLT3B',
      'Lutron Caseta Diva': 'B0BSHKS26L',
      'TP Link Switch': 'B01EZV35QU',
      'Leviton DSL06': 'B00NG0ELL0',
      'Lutron Diva': 'B085D8M2MR'
    }

    const realData: any[] = []

    targetProducts.forEach((product: string) => {
      const productAsin = productToAsin[product]
      if (!productAsin) return

      categories.forEach((category: string) => {
        const categoryReviews = allReviewData[category] || []
        const productReviews = categoryReviews.filter((review: any) => review.productId === productAsin)

        const positiveReviews = productReviews.filter((r: any) => r.sentiment === 'positive')
        const negativeReviews = productReviews.filter((r: any) => r.sentiment === 'negative')
        const totalReviews = positiveReviews.length + negativeReviews.length
        const satisfactionRate = totalReviews > 0 ? (positiveReviews.length / totalReviews) * 100 : 0

        const original = (projectData.competitorData as any).matrixData.find((it: any) => it.product === product && it.category === category)

        realData.push({
          product,
          category,
          categoryType: original?.categoryType || 'Physical',
          mentions: productReviews.length,
          satisfactionRate: Math.round(satisfactionRate * 10) / 10,
          positiveCount: positiveReviews.length,
          negativeCount: negativeReviews.length,
          totalReviews,
        })
      })
    })

    return realData
  }, [projectId, projectData])

  // Review panel context
  const reviewPanel = useReviewPanel()

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
              <Link href={`/project/${projectId}/chat`}>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <MessageSquare className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10 font-medium">Ask Xenith</span>
                  <div className="absolute inset-0 bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
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
            <Tabs value={activeTab || "use-cases"} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="use-cases">Use Case Analysis</TabsTrigger>
                <TabsTrigger value="categories">Critical Categories</TabsTrigger>
                <TabsTrigger value="competitors">Competitor Matrix</TabsTrigger>
              </TabsList>

              <TabsContent value="use-cases" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Top 10 Use Cases by Customer Mentions</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Most frequently mentioned use cases in customer reviews
                        </p>
                      </div>
                      <PinButton chart={{
                        id: "use-case-analysis",
                        title: "Top 10 Use Cases by Customer Mentions",
                        projectName: "Customer Pain Points Analysis",
                        projectId: "1",
                        lastUpdated: "2025-05-20",
                        autoUpdate: "weekly",
                        type: "bar",
                        isPinned: false
                      }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CategoryUseCaseBar data={projectData.useCaseData?.map(item => ({
                      category: item.categoryType,
                      useCase: item.useCase,
                      displayName: item.useCase.length > 15 ? item.useCase.substring(0, 15) + '...' : item.useCase,
                      totalMentions: item.totalMentions,
                      satisfactionRate: item.satisfactionRate,
                      negativeCount: item.negativeCount,
                      positiveCount: item.positiveCount,
                      neutralCount: 0
                    })) || []} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Top 10 Most Critical Categories by Negative Reviews Count</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Categories with highest volume of negative customer feedback
                        </p>
                      </div>
                      <PinButton chart={{
                        id: "critical-categories", 
                        title: "Top 10 Most Critical Categories by Negative Reviews Count",
                        projectName: "Customer Pain Points Analysis",
                        projectId: "1",
                        lastUpdated: "2025-05-20",
                        autoUpdate: "weekly",
                        type: "bar",
                        isPinned: false
                      }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CategoryPainPointsBar data={projectData.negativeCategories || []} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Competitor Delights and Pain Points Matrix</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Analysis for Leviton D215S, Leviton DSL06, Lutron Caseta Diva
                        </p>
                      </div>
                      <PinButton chart={{
                        id: "competitor-matrix",
                        title: "Competitor Pain Points Matrix", 
                        projectName: "Customer Pain Points Analysis",
                        projectId: "1",
                        lastUpdated: "2025-05-19",
                        autoUpdate: "weekly",
                        type: "matrix",
                        isPinned: false
                      }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CompetitorMatrix 
                      data={realCompetitorMatrixData}
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
                <Tabs value={activeTab || "brand-distribution"} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="brand-distribution">Brand Price Distribution</TabsTrigger>
                    <TabsTrigger value="revenue-analysis">Revenue Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="brand-distribution" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>Brand Price Distribution by Category</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Price ranges and positioning of different brands in dimmer and light switch categories
                            </p>
                          </div>
                          <PinButton chart={{
                            id: "brand-price-distribution",
                            title: "Brand Price Distribution Analysis",
                            projectName: "Dimmer Switch Price Analysis",
                            projectId: "2",
                            lastUpdated: "2025-05-18",
                            autoUpdate: "monthly",
                            type: "violin",
                            isPinned: false
                          }} />
                        </div>
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
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>Top 20 Products by Revenue (Price vs Revenue by Category)</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              How well products of different prices are selling in the market
                            </p>
                          </div>
                          <PinButton chart={{
                            id: "revenue-analysis", 
                            title: "Revenue Analysis by Price Segment",
                            projectName: "Dimmer Switch Price Analysis",
                            projectId: "2",
                            lastUpdated: "2025-05-17",
                            autoUpdate: null,
                            type: "scatter",
                            isPinned: false
                          }} />
                        </div>
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

      {/* Review Panel (opens when a matrix cell is clicked) */}
      <ReviewPanel
        isOpen={reviewPanel.isOpen}
        onClose={reviewPanel.closePanel}
        reviews={reviewPanel.reviews}
        title={reviewPanel.title}
        subtitle={reviewPanel.subtitle}
        showFilters={reviewPanel.showFilters}
      />
    </div>
  )
}
