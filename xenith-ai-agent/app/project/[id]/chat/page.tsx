"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquare, TrendingUp, BarChart3, PieChart, Lightbulb, Send, Loader2, X, Clock, User, Edit3, ArrowLeft, CheckCircle } from 'lucide-react'
import { LutronPieChart } from "@/components/charts/lutron-pie-chart"
import { getPriceSegments } from "@/lib/lutron-data"
import { MemoryEditor } from "@/components/ui/memory-editor"
import { ReviewPanel } from "@/components/ui/review-panel"
import { useReviewPanel } from "@/lib/review-panel-context"
// Import Project 1 components and data
import CategoryUseCaseBar from "@/components/CategoryUseCaseBar"
import { CategoryPainPointsBar } from "@/components/charts/category-pain-points-bar"
import { CompetitorMatrix } from "@/components/charts/competitor-matrix"
import { PinButton } from "@/components/ui/pin-button"
import { getTopUseCases, getTopNegativeCategories } from "@/lib/categoryFeedback"
import { getCompetitorAnalysisData } from "@/lib/competitorAnalysis"
// Import Project 2 components and data
import { PricingAnalysis } from "@/components/pricing-analysis"
import { ScatterChart } from "@/components/charts/scatter-chart"
import { PriceTypeSelector, type PriceType } from "@/components/price-type-selector"
import { MetricTypeSelector, type MetricType } from "@/components/metric-type-selector"
import { fetchDashboardData } from "@/lib/data"
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart"
import { generateCategoryTrendData } from "@/lib/categoryTrendData"
import { CategoryTrendLineChart } from "@/components/charts/category-trend-line-chart"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isAnalyzing?: boolean
  keyInsights?: string[]
  executiveSummary?: string
  hasChart?: boolean
  showExecutiveSummary?: boolean
  showSupportingCharts?: boolean
  showKeyInsights?: boolean
  currentInsightIndex?: number
  initialResponseComplete?: boolean
  insightTexts?: string[]
  supportingChartsLoading?: boolean
  chartType?: 'useCase' | 'categories' | 'competitors' | 'lutron' | 'brandPriceDistribution' | 'priceVsRevenue' | 'lutronPieChart' | 'categoryTrend' | 'topSegments' | 'dimmerPriceAnalysis'
  isHistorical?: boolean
  showMemoryTag?: boolean
}

interface TypewriterTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  key?: string
}

function TypewriterText({ text, speed = 15, onComplete, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("")
    setCurrentIndex(0)
    setHasCompleted(false)
  }, [text])

  useEffect(() => {
    if (!hasCompleted && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    } else if (!hasCompleted && currentIndex === text.length && text.length > 0) {
      setHasCompleted(true)
      if (onComplete) {
        onComplete()
      }
    }
  }, [currentIndex, text, speed, onComplete, hasCompleted])

  return <span className={className}>{displayedText}</span>
}

interface AnalyzingLoaderProps {
  stage: string
  progress: number
}

function AnalyzingLoader({ stage, progress }: AnalyzingLoaderProps) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="relative">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-blue-900">{stage}</span>
          <span className="text-xs text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Memory Tag Component
function MemoryTag({ onMemoryClick }: { onMemoryClick: () => void }) {
  return (
    <div className="mt-3 animate-fadeIn">
      <div className="flex items-center space-x-2 text-sm">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-green-600">One preference added to</span>
        <button 
          onClick={onMemoryClick}
          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
        >
          Memory
        </button>
      </div>
    </div>
  )
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showTopics, setShowTopics] = useState(false)
  const [currentStage, setCurrentStage] = useState("")
  const [currentProgress, setCurrentProgress] = useState(0)
  const [project1Data, setProject1Data] = useState<any>(null)
  const [project2Data, setProject2Data] = useState<any>(null)
  const [priceType, setPriceType] = useState<PriceType>("unit")
  const [metricType, setMetricType] = useState<MetricType>("revenue")
  const [projectId, setProjectId] = useState<string>("")
  const [highlightSend, setHighlightSend] = useState(false)
  const [isTypingExample, setIsTypingExample] = useState(false)
  const [conversationStep, setConversationStep] = useState(0) // 0: 第一步, 1: 第二步, 2: 第三步及以后
  const [showMemoryEditor, setShowMemoryEditor] = useState(false)
  
  // Get project info
  const projectName = projectId === "1" ? "Customer Pain Points Analysis" : "New Project"

  // Get project ID from params
  useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id)
    })
  }, [params])

  
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const executiveSummaryRef = useRef<HTMLDivElement | null>(null)
  const supportingChartsRef = useRef<HTMLDivElement | null>(null)
  const keyInsightsRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle URL hash for anchor navigation
  useEffect(() => {
    // Check if there's a hash in the URL and data is loaded
    if (typeof window !== 'undefined' && window.location.hash && project1Data) {
      const hash = window.location.hash.substring(1) // Remove the # symbol
      
      // Wait for content to render before scrolling
      const timeoutId = setTimeout(() => {
        const targetElement = document.getElementById(hash)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 1000) // Give time for historical messages to render
      
      return () => clearTimeout(timeoutId)
    }
  }, [project1Data, messages])

  // Load Project 1 data and initialize historical conversation
  useEffect(() => {
    if (!projectId) return // Wait until projectId is loaded
    
    if (projectId === "1") {
      // Load data for Project 1 charts
      const useCaseData = getTopUseCases('dimmer', 15)
      const negativeCategories = getTopNegativeCategories('dimmer', 10)
      const competitorData = getCompetitorAnalysisData()
      
      const categoryTrendData = generateCategoryTrendData(negativeCategories)
      
      setProject1Data({
        useCaseData,
        negativeCategories,
        competitorData,
        categoryTrendData,
      })

      // Initialize historical conversation for Project 1
      const historicalMessages: Message[] = [
        {
          id: "hist-2",
          content: "",
          isUser: false,
          timestamp: new Date(Date.now() - 250000),
          isHistorical: true,
          hasChart: true,
          chartType: 'categories',
          showExecutiveSummary: false,
          showSupportingCharts: true,
          showKeyInsights: true,
          keyInsights: [
            "Installation leads with the highest negative review count, indicating systematic issues with product setup procedures and documentation.",
            "App and connectivity problems rank second, highlighting the critical importance of software reliability in smart home devices.",
            "Build quality concerns appear frequently, suggesting potential manufacturing or design issues affecting long-term durability.",
            "Dimming control performance issues affect user satisfaction, pointing to core functionality gaps that need immediate attention."
          ]
        },
        {
          id: "hist-3",
          content: "What are the trends for these categories over the last year?",
          isUser: true,
          timestamp: new Date(Date.now() - 150000), // 2.5 minutes ago
          isHistorical: true
        },
        {
          id: "hist-4",
          content: "",
          isUser: false,
          timestamp: new Date(Date.now() - 130000),
          isHistorical: true,
          hasChart: true,
          chartType: 'categoryTrend',
          showExecutiveSummary: false,
          showSupportingCharts: true,
          showKeyInsights: true,
          keyInsights: [
            "Product Lifespan complaints show a 25% increase in the last twelve months, indicating long-term reliability is deteriorating in consumer perception.",
            "Network Connection Stability issues peaked mid-year but have declined 10% following recent firmware updates.",
            "Product Reliability complaints remain consistently high with only marginal improvement, suggesting systemic quality concerns persist.",
            "Dimming Control Performance shows seasonal fluctuation with a modest upward trend, pointing to unresolved usability issues."
          ]
        },
        {
          id: "hist-5",
          content: "Show that for 3 top selling products by Leviton and 3 top competitors",
          isUser: true,
          timestamp: new Date(Date.now() - 100000), // 1+ minutes ago
          isHistorical: true
        },
        {
          id: "hist-6",
          content: "",
          isUser: false,
          timestamp: new Date(Date.now() - 80000),
          isHistorical: true,
          hasChart: true,
          chartType: 'competitors',
          showExecutiveSummary: false,
          showSupportingCharts: true,
          showKeyInsights: true,
          keyInsights: [
            "Leviton D215S shows strong performance in installation categories but faces challenges with app connectivity and advanced features.",
            "Leviton DSL06 demonstrates consistent moderate performance across categories, with particular strength in basic switch functionality.",
            "Lutron Caseta Diva excels in app integration and smart features but shows some installation complexity issues.",
            "Cross-brand analysis reveals that no single product dominates all categories, indicating opportunities for targeted improvements."
          ]
        }
      ]

      setMessages(historicalMessages)
    } else if (projectId === "2") {
      // Load data for Project 2 charts but don't initialize historical messages
      fetchDashboardData().then((dashboardData) => {
        setProject2Data({
          dashboardData,
          priceSegments: getPriceSegments()
        })
        // Project 2 starts with empty messages for new conversation
      }).catch((error) => {
        console.error('Error loading dashboard data:', error)
      })
    }
  }, [projectId])

  const simulateAnalysis = async (): Promise<void> => {
    const stages = [
      "Analyzing market data...",
      "Processing price segments...",
      "Calculating market share...",
      "Generating insights...",
      "Preparing visualizations..."
    ]

    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(stages[i])
      
      // Animate progress for each stage - slowed down by 2x
      for (let progress = 0; progress <= 100; progress += 10) {
        setCurrentProgress((i * 100 + progress) / stages.length)
        await new Promise(resolve => setTimeout(resolve, 50)) // Changed from 25ms to 50ms
      }
      
      await new Promise(resolve => setTimeout(resolve, 300)) // Changed from 150ms to 300ms
    }
  }

  // Sequential display management
  const onInitialResponseComplete = (messageId: string) => {
    // For project 1 (all types) and project 2 (topSegments, dimmerPriceAnalysis), skip Executive Summary and go directly to Key Insights
    setTimeout(() => {
      setMessages(prev => {
        const message = prev.find(msg => msg.id === messageId)
        if (projectId === "1" || message?.chartType === 'topSegments' || message?.chartType === 'dimmerPriceAnalysis') {
          return prev.map(msg => {
            if (msg.id !== messageId) return msg
            return { 
              ...msg, 
              showKeyInsights: true,
              currentInsightIndex: 0,
              insightTexts: msg.keyInsights ? [...msg.keyInsights] : []
            }
          })
        }
        // For project 2 other types, show Executive Summary
        return prev.map(msg => {
          if (msg.id !== messageId) return msg
          return { ...msg, showExecutiveSummary: true }
        })
      })
      
      // Scroll to appropriate section
      const message = messages.find(msg => msg.id === messageId)
      if (projectId === "1" || message?.chartType === 'topSegments' || message?.chartType === 'dimmerPriceAnalysis') {
        setTimeout(() => scrollToSection(keyInsightsRef), 500)
      } else {
        setTimeout(() => scrollToSection(executiveSummaryRef), 500)
      }
    }, 500)
  }

  const onExecutiveSummaryComplete = (messageId: string) => {
    // Step 2: Show Supporting Charts after Executive Summary completes
    setTimeout(() => {
      // First show loading state for Supporting Charts
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, showSupportingCharts: true, supportingChartsLoading: true } : msg
      ))
      setTimeout(() => scrollToSection(supportingChartsRef), 500)
      
      // Then show actual content after loading - faster for project 2
      const loadingDuration = projectId === "2" ? 500 : 1500 // Faster loading for project 2
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, supportingChartsLoading: false } : msg
        ))
        
        // Auto trigger Key Insights after chart loads - faster for project 2
        const insightDelay = projectId === "2" ? 1500 : 3000 // Adjusted insights delay for project 2
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { 
              ...msg, 
              showKeyInsights: true, 
              currentInsightIndex: 0,
              insightTexts: msg.keyInsights ? [...msg.keyInsights] : []
            } : msg
          ))
          setTimeout(() => scrollToSection(keyInsightsRef), 500)
        }, insightDelay)
      }, loadingDuration)
    }, 1500) // Initial delay remains the same
  }

  const onInsightComplete = (messageId: string, currentIndex: number, totalInsights: number) => {
    // Show next insight after current one completes
    if (currentIndex < totalInsights - 1) {
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, currentInsightIndex: currentIndex + 1 } : msg
        ))
      }, 300)
    } else {
      // All insights completed, show Supporting Charts for project 1 (all types) and project 2 (topSegments, dimmerPriceAnalysis)
      const message = messages.find(msg => msg.id === messageId)
      if (projectId === "1" || message?.chartType === 'topSegments' || message?.chartType === 'dimmerPriceAnalysis') {
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, showSupportingCharts: true, supportingChartsLoading: false } : msg
          ))
          setTimeout(() => scrollToSection(supportingChartsRef), 500)
        }, 1000) // Wait a moment after all insights complete
      }
    }
  }

  // ===== Helpers: Top Selling Segments =====
  const segmentColors = [
    "#E67E22", "#3498DB", "#9B59B6", "#2ECC71", "#F39C12",
    "#E74C3C", "#1ABC9C", "#34495E", "#F1C40F", "#95A5A6",
    "#8E44AD", "#27AE60", "#D35400", "#2980B9", "#C0392B"
  ]

  const wrapText = (text: string, maxLength: number = 12) => {
    if (text.length <= maxLength) return text
    const words = text.split(' ')
    let lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines.join('\n')
  }

  const getTopSellingSegmentsChartData = () => {
    const segmentRevenue = project2Data?.dashboardData?.marketInsights?.segmentRevenue
    console.log('DEBUG ‣ segmentRevenue', segmentRevenue)
    if (!segmentRevenue) {
      console.warn('DEBUG ‣ segmentRevenue is undefined — returning empty array for chart data')
      return []
    }
    const combined: any[] = [
      ...segmentRevenue.dimmerSwitches,
      ...segmentRevenue.lightSwitches,
    ]
    const top10 = combined.sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    console.log('DEBUG ‣ top10 combined segments', top10)
    return top10.map((item, index) => {
      const cleanName = item.segment
        .replace(" Dimmer Switches", " Dimmer")
        .replace(" Switches", " Switch")
        .replace("Smart Wi-Fi Enabled", "Wi-Fi Smart")
        .replace("Smart Hub-Dependent", "Hub-Dependent Smart")
        .replace("WiFi Connected", "WiFi")
      return {
        name: wrapText(cleanName, 12),
        value: item.revenue,
        fill: segmentColors[index % segmentColors.length]
      }
    })
  }

  // Debug log when component renders Supporting Charts
  useEffect(() => {
    if (messages.some(m => m.chartType === 'topSegments')) {
      console.log('DEBUG ‣ topSegments chartData', getTopSellingSegmentsChartData())
    }
  }, [messages])

  // Get Dimmer-only data for price analysis
  const getDimmerOnlyData = () => {
    const dimmerProducts = project2Data?.dashboardData?.productAnalysis?.priceVsRevenue
      ?.find((cat: any) => cat.category === "Dimmer Switches")?.products || []
    
    return dimmerProducts.map((p: any) => ({
      x: p.unitPrice,
      y: p.revenue,
      name: p.name,
      brand: p.brand,
      volume: p.volume,
      revenue: p.revenue,
      category: "🔆 Dimmer Switches"
    }))
  }

  // Generate Key Insights for Dimmer price analysis
  const generateDimmerInsights = () => {
    const dimmerData = getDimmerOnlyData()
    if (dimmerData.length === 0) return []

    // Sort by revenue to get top performers
    const topByRevenue = [...dimmerData].sort((a, b) => b.y - a.y).slice(0, 3)
    
    return [
      `${topByRevenue[0]?.name.split(',')[0]} leads dimmer sales with $${(topByRevenue[0]?.y || 0).toLocaleString()} in revenue, demonstrating strong market demand for premium smart dimmer solutions.`,
      `Price analysis shows dimmer switches range from $${Math.min(...dimmerData.map((d: any) => d.x)).toFixed(2)} to $${Math.max(...dimmerData.map((d: any) => d.x)).toFixed(2)}, with higher-priced units typically generating more revenue per product.`,
      `${topByRevenue[1]?.brand} and ${topByRevenue[2]?.brand} brands show strong performance in the dimmer category, indicating diverse consumer preferences across different price segments.`,
      "The dimmer market shows clear correlation between product features, brand positioning, and revenue generation, with smart connectivity being a key value driver."
    ]
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      if (conversationStep === 0) {
        // 第一步：返回 topSegments 回答
        // Add analyzing message
        const analyzingMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "",
          isUser: false,
          timestamp: new Date(),
          isAnalyzing: true
        }

        setMessages(prev => [...prev, analyzingMessage])

        // Simulate analysis process
        await simulateAnalysis()

        // Remove analyzing message and add results
        setMessages(prev => prev.filter(msg => !msg.isAnalyzing))

        // Always return the Top Selling Product Segments answer
        const chartData = getTopSellingSegmentsChartData()
        const top3 = chartData.slice(0, 3)

        const aiResponse: Message = {
              id: (Date.now() + 2).toString(),
          content: "Here's the breakdown of the top selling product segments based on dimmer and light-switch sales.",
              isUser: false,
              timestamp: new Date(),
              hasChart: true,
          chartType: 'topSegments',
          showSupportingCharts: false,
          supportingChartsLoading: false,
          showKeyInsights: false,
              currentInsightIndex: 0,
              initialResponseComplete: false,
              keyInsights: [
            `${top3[0]?.name.replace(/\n/g, ' ')} leads overall sales with $${(top3[0]?.value || 0).toLocaleString()} in revenue, highlighting strong consumer interest in smart, connected controls.`,
            `${top3[1]?.name.replace(/\n/g, ' ')} follows closely, indicating continued popularity of traditional yet reliable switch designs.`,
            `${top3[2]?.name.replace(/\n/g, ' ')} ranks third, showcasing market demand for versatile multi-location installations.`,
            "The dominance of smart and Wi-Fi enabled segments underscores the growing importance of connectivity and user convenience across both dimmer and light-switch categories."
              ]
            }

        setMessages(prev => [...prev, aiResponse])

        // Trigger SSE effect chain for non-historical messages
        if (!aiResponse.isHistorical) {
          setTimeout(() => {
            onInitialResponseComplete(aiResponse.id)
          }, 1000) // Start SSE effects after 1 second
        }

        setConversationStep(1)

      } else if (conversationStep === 1) {
        // 第二步：返回 Memory 更新回答
        const dimmerCount = project2Data?.dashboardData?.executiveSummary?.productDistribution
          ?.find((item: any) => item.name === "Dimmer Switches")?.value || "151"

        const aiResponse: Message = {
          id: (Date.now() + 2).toString(),
          content: `Understood. We'll now focus on the ${dimmerCount} dimmer products in this category.`,
          isUser: false,
          timestamp: new Date(),
          showMemoryTag: false,
          initialResponseComplete: false
        }

        setMessages(prev => [...prev, aiResponse])

        // Start SSE for the text first
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiResponse.id 
              ? { ...msg, initialResponseComplete: true }
              : msg
          ))
          
          // Then show Memory tag after text is complete
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === aiResponse.id 
                ? { ...msg, showMemoryTag: true }
                : msg
            ))
          }, 1500) // Delay for Memory tag appearance
        }, 1000)

        setConversationStep(2)

      } else {
        // 第三步及以后：返回 dimmerPriceAnalysis 回答
        
        // First show analyzing loader
        const analyzingMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "",
          isUser: false,
          timestamp: new Date(),
          isAnalyzing: true
        }

        setMessages(prev => [...prev, analyzingMessage])
        setIsLoading(true)

        // Use the same detailed analysis process as step 1
        await simulateAnalysis()

        // Remove analyzing message and add actual response
        setMessages(prev => prev.filter(msg => msg.id !== analyzingMessage.id))

        const aiResponse: Message = {
          id: (Date.now() + 2).toString(),
          content: "Here's the detailed price analysis focusing specifically on dimmer products and their market performance.",
          isUser: false,
          timestamp: new Date(),
          hasChart: true,
          chartType: 'dimmerPriceAnalysis',
          showSupportingCharts: false,
          supportingChartsLoading: false,
          showKeyInsights: false,
          currentInsightIndex: 0,
          initialResponseComplete: false,
          keyInsights: generateDimmerInsights()
        }

        setMessages(prev => [...prev, aiResponse])

        // Trigger SSE effect chain for non-historical messages
        if (!aiResponse.isHistorical) {
          setTimeout(() => {
            onInitialResponseComplete(aiResponse.id)
          }, 1000) // Start SSE effects after 1 second
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
      setCurrentStage("")
      setCurrentProgress(0)
    }
  }

  const examplePrompts = [
    {
      icon: BarChart3,
      title: "Top Selling Product Segments",
      description: "Identify which product segments lead in sales",
      prompt: "What are the top selling product segments?"
    },
    {
      icon: PieChart,
      title: "Brand Market Share",
      description: "Show market share for each brand",
      prompt: "What is the market share by brand?"
    },
    {
      icon: TrendingUp,
      title: "Customer Pain Points Trend",
      description: "Analyze trend of customer pain points",
      prompt: "How have customer pain points trended over time?"
    },
    {
      icon: Lightbulb,
      title: "Opportunities Missed by Competitors",
      description: "Find use cases competitors fail to address",
      prompt: "Which use cases are underserved by competitors?"
    }
  ]

  const handleExampleClick = (prompt: string) => {
    if (isLoading) return

    setInput(prompt)
    // Immediately send the message without typing effect
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderExecutiveSummaryWithMemoryLink = (text: string, messageId: string) => {
    // Check if the text contains memory reference patterns
    const memoryPattern = /According to my memory[^,]*,/
    const match = text.match(memoryPattern)
    
    if (match) {
      const beforeMemory = text.substring(0, match.index)
      const memoryText = match[0]
      const afterMemory = text.substring((match.index || 0) + memoryText.length)
      
      return (
        <span className="text-gray-700 leading-relaxed">
          {beforeMemory}
          <MemoryEditor>
            <button className="text-blue-600 hover:text-blue-800 underline font-medium">
              {memoryText}
            </button>
          </MemoryEditor>
          <TypewriterText 
            text={afterMemory} 
            speed={10} 
            onComplete={() => onExecutiveSummaryComplete(messageId)}
          />
        </span>
      )
    }
    
    return (
      <span className="text-gray-700 leading-relaxed">
        <TypewriterText 
          text={text} 
          speed={10} 
          onComplete={() => onExecutiveSummaryComplete(messageId)}
        />
      </span>
    )
  }

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

  // Review panel context
  const reviewPanel = useReviewPanel()

  return (
    <>
    <div className="flex h-screen bg-gray-50">
      {/* Topics Sidebar */}
      <div className={`${showTopics ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Topics</h2>
          <div className="space-y-3">
            {["Market Analysis", "Competitive Intelligence", "Customer Insights", "Price Optimization"].map((topic) => (
              <div key={topic} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <div className="font-medium text-sm">{topic}</div>
                <div className="text-xs text-gray-500 mt-1">Recent discussions</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/`)}
                className="text-gray-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTopics(!showTopics)}
                className="text-gray-600"
              >
                <MessageSquare className="h-4 w-4" />
                Topics
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <h1 className="text-lg font-semibold">{projectName}</h1>
                <p className="text-sm text-gray-600">Smart Home &gt; Dimmer &amp; Light Switches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Xenith</h2>
                
                {projectId === "2" && (
                  <div className="w-full max-w-4xl mx-auto">
                    {/* Chat input */}
                    <div className="flex space-x-3 max-w-2xl mx-auto">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="How can I help you?"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading || isTypingExample}
                        className={`px-4 py-2 ${highlightSend ? 'ring-2 ring-blue-400 animate-pulse' : ''}`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* FAQ list with 2-column grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                      {examplePrompts.map((example, index) => (
                        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleExampleClick(example.prompt)}>
                          <CardHeader className="pb-2 pt-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <example.icon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-sm text-left leading-tight">{example.title}</CardTitle>
                                <CardDescription className="text-xs text-left mt-1 leading-tight">{example.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Messages */
              messages.map((message) => (
                <div key={message.id} className="w-full">
                  {message.isUser ? (
                    /* User Message */
                    <div className="flex justify-end">
                      <div className="flex flex-row-reverse space-x-3 space-x-reverse max-w-2xl">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-blue-600 text-white">JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-blue-600 text-white rounded-lg px-4 py-2">
                            <span className="text-white">
                              {message.content}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* AI Message */
                    <div className="w-full">
                      <div className="flex space-x-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-gray-600 text-white">X</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 pr-12">
                      {message.isAnalyzing ? (
                        <AnalyzingLoader stage={currentStage} progress={currentProgress} />
                      ) : message.content ? (
                        <div className={`p-4 rounded-lg ${message.isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>
                          {message.isHistorical ? (
                            // For historical messages, show content immediately without typewriter effect
                            <span className={message.isUser ? 'text-white' : 'text-gray-900'}>
                              {message.content}
                            </span>
                          ) : (
                            <TypewriterText 
                              text={message.content}
                              speed={message.isUser ? 0 : 10}
                              className={message.isUser ? 'text-white' : 'text-gray-900'}
                              onComplete={() => !message.isUser && onInitialResponseComplete(message.id)}
                            />
                          )}
                        </div>
                      ) : null}

                      {/* Memory Tag */}
                      {!message.isUser && message.showMemoryTag && (
                        <div className="mt-4">
                          <MemoryEditor open={showMemoryEditor} onOpenChange={setShowMemoryEditor}>
                            <MemoryTag onMemoryClick={() => setShowMemoryEditor(true)} />
                          </MemoryEditor>
                        </div>
                      )}

                      {/* AI Response Cards */}
                      {!message.isUser && !message.isAnalyzing && (message.keyInsights || message.executiveSummary) && (
                        <div className="mt-6 space-y-6">
                          {/* Executive Summary - First */}
                          {message.showExecutiveSummary && (
                            <Card ref={executiveSummaryRef} className="border-l-4 border-l-green-500">
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                  <span>Executive Summary</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {message.isHistorical ? (
                                  <span className="text-gray-700 leading-relaxed">{message.executiveSummary}</span>
                                ) : (
                                  renderExecutiveSummaryWithMemoryLink(message.executiveSummary || "", message.id)
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Key Insights - First */}
                          {message.showKeyInsights && message.keyInsights && (
                            <Card ref={keyInsightsRef} className="border-l-4 border-l-blue-500">
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <Lightbulb className="h-5 w-5 text-blue-600" />
                                  <span>Key Insights</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {message.keyInsights.map((insight, index) => {
                                    if (message.isHistorical) {
                                      // For historical messages, show all insights immediately
                                      return (
                                        <div key={`insight-${message.id}-${index}`} className="flex items-start space-x-3">
                                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                          </div>
                                          <span className="text-gray-700 leading-relaxed">{insight}</span>
                                        </div>
                                      )
                                    } else {
                                      // For new messages, use typewriter effect
                                      const currentIndex = message.currentInsightIndex ?? 0
                                      const isVisible = index <= currentIndex
                                      const isActive = index === currentIndex
                                      const isCompleted = index < currentIndex
                                      
                                      return (
                                        <div key={`insight-${message.id}-${index}`} className={`flex items-start space-x-3 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                          </div>
                                          {isActive ? (
                                            <TypewriterText 
                                              key={`typewriter-${message.id}-${index}`}
                                              text={insight}
                                              speed={8}
                                              className="text-gray-700 leading-relaxed"
                                              onComplete={() => onInsightComplete(message.id, index, message.keyInsights?.length || 0)}
                                            />
                                          ) : isCompleted ? (
                                            <span className="text-gray-700 leading-relaxed">{insight}</span>
                                          ) : null}
                                        </div>
                                      )
                                    }
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Supporting Charts - Second */}
                          {message.showSupportingCharts && (
                            <Card ref={supportingChartsRef} className="border-l-4 border-l-purple-500">
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <BarChart3 className="h-5 w-5 text-purple-600" />
                                  <span>Supporting Charts</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {message.supportingChartsLoading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="flex items-center space-x-3">
                                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                      <span className="text-sm text-gray-600">Generating charts...</span>
                                    </div>
                                  </div>
                                ) : message.hasChart ? (
                                  <div className="space-y-6">
                                    {message.chartType === 'topSegments' && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-semibold text-gray-900">Top 10 Product Segments by Revenue</h4>
                                          <PinButton chart={{
                                            id: "top-segments-revenue",
                                            title: "Top 10 Product Segments by Revenue",
                                            projectName: projectId === "1" ? "Customer Pain Points Analysis" : "New Project",
                                            projectId: projectId,
                                            lastUpdated: "2025-05-29",
                                            autoUpdate: "montly",
                                            type: "bar",
                                            isPinned: false
                                          }} />
                                        </div>
                                        <div className="relative h-[600px]">
                                          <GroupedBarChart
                                            data={getTopSellingSegmentsChartData()}
                                            index="name"
                                            categories={["value"]}
                                            colors={segmentColors}
                                            metricType="revenue"
                                            xAxisLabel="Product Segment"
                                            yAxisLabel="Revenue ($)"
                                            title="Top 10 Product Segments by Revenue"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {message.chartType === 'dimmerPriceAnalysis' && project2Data?.dashboardData?.productAnalysis && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-semibold text-gray-900">Price vs Revenue Analysis (Dimmer Products Only)</h4>
                                          <PinButton chart={{
                                            id: "dimmer-price-analysis",
                                            title: "Price vs Revenue Analysis (Dimmer Products Only)",
                                            projectName: "New Project",
                                            projectId: "2",
                                            lastUpdated: "2025-06-25",
                                            autoUpdate: null,
                                            type: "scatter",
                                            isPinned: false
                                          }} />
                                        </div>
                                        <div className="relative h-[600px]">
                                          <ScatterChart
                                            dimmerData={getDimmerOnlyData()}
                                            switchData={[]} // Empty for dimmer-only analysis
                                            xAxisLabel="Price (USD)"
                                            yAxisLabel="Revenue (USD)"
                                            priceType="unit"
                                            metricType="revenue"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {message.chartType === 'categories' && project1Data?.negativeCategories && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-semibold text-gray-900">Category Pain Points Trend Analysis</h4>
                                          <PinButton chart={{
                                            id: "critical-categories",
                                            title: "Category Pain Points Trend Analysis",
                                            projectName: "Customer Pain Points Analysis",
                                            projectId: "1",
                                            lastUpdated: "2025-05-29",
                                            autoUpdate: "monthly",
                                            type: "bar",
                                            isPinned: false
                                          }} />
                                        </div>
                                        <div className="relative" id="critical-categories">
                                          <CategoryPainPointsBar data={project1Data.negativeCategories} />
                                        </div>
                                      </div>
                                    )}
                                    {message.chartType === 'categoryTrend' && project1Data?.categoryTrendData && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-semibold text-gray-900">Category Pain Points Trend Over Time</h4>
                                          <PinButton chart={{
                                            id: "category-trend-analysis",
                                            title: "Category Pain Points Trend Over Time",
                                            projectName: "Customer Pain Points Analysis",
                                            projectId: "1",
                                            lastUpdated: "2025-05-29",
                                            autoUpdate: "montly",
                                            type: "line",
                                            isPinned: true
                                          }} />
                                        </div>
                                        <div className="relative" id="category-trend">
                                          <CategoryTrendLineChart data={project1Data.categoryTrendData} />
                                        </div>
                                      </div>
                                    )}
                                    {message.chartType === 'competitors' && project1Data?.competitorData && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-semibold text-gray-900">Competitor Pain Points Matrix</h4>
                                          <PinButton chart={{
                                            id: "competitor-pain-matrix",
                                            title: "Competitor Pain Points Matrix",
                                            projectName: "Customer Pain Points Analysis",
                                            projectId: "1",
                                            lastUpdated: "2025-05-29",
                                            autoUpdate: null,
                                            type: "matrix",
                                            isPinned: false
                                          }} />
                                        </div>
                                        <div className="relative" id="competitor-matrix">
                                          <CompetitorMatrix
                                            data={project1Data.competitorData.matrixData || []}
                                            targetProducts={project1Data.competitorData.targetProducts || []}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    No specific charts available for this analysis. The insights above provide comprehensive coverage of the requested information.
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        {!(projectId === "2" && messages.length === 0) && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="How can I help you?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || isTypingExample}
                className={`px-4 py-2 ${highlightSend ? 'ring-2 ring-blue-400 animate-pulse' : ''}`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>

    {/* Review Panel */}
    <ReviewPanel
      isOpen={reviewPanel.isOpen}
      onClose={reviewPanel.closePanel}
      reviews={reviewPanel.reviews}
      title={reviewPanel.title}
      subtitle={reviewPanel.subtitle}
      showFilters={reviewPanel.showFilters}
    />
    </>
  )
} 