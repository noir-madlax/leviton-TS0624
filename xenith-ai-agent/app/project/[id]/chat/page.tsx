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
import { MessageSquare, TrendingUp, BarChart3, PieChart, Lightbulb, Send, Loader2, X, Clock, User, Edit3, ArrowLeft } from 'lucide-react'
import { LutronPieChart } from "@/components/charts/lutron-pie-chart"
import { getPriceSegments } from "@/lib/lutron-data"
import { MemoryEditor } from "@/components/ui/memory-editor"
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
import { CategoryTrendLineChart } from "@/components/charts/category-trend-line-chart"
import { generateCategoryTrendData } from "@/lib/categoryTrendData"

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
  chartType?: 'useCase' | 'categories' | 'competitors' | 'lutron' | 'brandPriceDistribution' | 'priceVsRevenue' | 'lutronPieChart' | 'categoryTrend'
  isHistorical?: boolean
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
  
  // Get project info
  const projectName = projectId === "1" ? "Customer Pain Points Analysis" : "Dimmer Switch Price Analysis"

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
          id: "hist-3",
          content: "What product features do customers complain about the most?",
          isUser: true,
          timestamp: new Date(Date.now() - 200000), // 3+ minutes ago
          isHistorical: true
        },
        {
          id: "hist-4",
          content: "",
          isUser: false,
          timestamp: new Date(Date.now() - 180000),
          isHistorical: true,
          hasChart: true,
          chartType: 'categories',
          showExecutiveSummary: true,
          showSupportingCharts: true,
          showKeyInsights: true,
          keyInsights: [
            "Installation leads with the highest negative review count, indicating systematic issues with product setup procedures and documentation.",
            "App and connectivity problems rank second, highlighting the critical importance of software reliability in smart home devices.",
            "Build quality concerns appear frequently, suggesting potential manufacturing or design issues affecting long-term durability.",
            "Switch performance issues directly impact core functionality, representing fundamental product reliability concerns."
          ],
          executiveSummary: "The critical categories analysis reveals that operational aspects (installation, connectivity, build quality) generate more negative feedback than core electrical functionality. This pattern suggests that while the fundamental dimming technology is sound, the user experience and product ecosystem need significant improvement to reduce customer dissatisfaction."
        },
        {
          id: "hist-5",
          content: "What are the trends for these categories over the last year?",
          isUser: true,
          timestamp: new Date(Date.now() - 150000), // 2.5 minutes ago
          isHistorical: true
        },
        {
          id: "hist-6",
          content: "",
          isUser: false,
          timestamp: new Date(Date.now() - 130000),
          isHistorical: true,
          hasChart: true,
          chartType: 'categoryTrend',
          showExecutiveSummary: true,
          showSupportingCharts: true,
          showKeyInsights: true,
          keyInsights: [
            "Product Lifespan complaints show a 25% increase in the last twelve months, indicating long-term reliability is deteriorating in consumer perception.",
            "Network Connection Stability issues peaked mid-year but have declined 10% following recent firmware updates.",
            "Product Reliability complaints remain consistently high with only marginal improvement, suggesting systemic quality concerns persist.",
            "Dimming Control Performance shows seasonal fluctuation with a modest upward trend, pointing to unresolved usability issues."
          ],
          executiveSummary: "Overall trend analysis demonstrates that performance-related categories continue to accumulate negative feedback over time. The persistent rise in Product Lifespan and Reliability complaints underscores the need for design and quality improvements. Conversely, targeted software updates appear effective in reducing connectivity-related issues."
        },
        {
          id: "hist-7",
          content: "Show that for Leviton D215S, Leviton DSL06, Lutron Caseta Diva",
          isUser: true,
          timestamp: new Date(Date.now() - 100000), // 1+ minutes ago
          isHistorical: true
        },
        {
          id: "hist-8",
          content: "",
          isUser: false,
          timestamp: new Date(Date.now() - 80000),
          isHistorical: true,
          hasChart: true,
          chartType: 'competitors',
          showExecutiveSummary: true,
          showSupportingCharts: true,
          showKeyInsights: true,
          keyInsights: [
            "Leviton D215S shows strong performance in installation categories but faces challenges with app connectivity and advanced features.",
            "Leviton DSL06 demonstrates consistent moderate performance across categories, with particular strength in basic switch functionality.",
            "Lutron Caseta Diva excels in app integration and smart features but shows some installation complexity issues.",
            "Cross-brand analysis reveals that no single product dominates all categories, indicating opportunities for targeted improvements."
          ],
          executiveSummary: "The competitive matrix for the three specified products shows distinct positioning strategies. Leviton products focus on installation simplicity and basic functionality, while Lutron emphasizes smart features and app integration. Each product has specific strengths and weaknesses, creating a diversified competitive landscape where customer choice depends on priority features and technical comfort level."
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
    // Step 1: Show Executive Summary after initial response completes
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, showExecutiveSummary: true } : msg
      ))
      setTimeout(() => scrollToSection(executiveSummaryRef), 500)
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
    }
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

    // Add analyzing message
    const analyzingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      isUser: false,
      timestamp: new Date(),
      isAnalyzing: true
    }

    setMessages(prev => [...prev, analyzingMessage])

    try {
      // Simulate analysis process
      await simulateAnalysis()

      // Remove analyzing message and add results
      setMessages(prev => prev.filter(msg => !msg.isAnalyzing))

      let aiResponse: Message

      if (projectId === "2") {
        // Handle Project 2 specific questions
        const userQuestion = input.trim().toLowerCase()
        
        if (userQuestion.includes("competitors") && userQuestion.includes("price")) {
          // First question: competitor pricing
          aiResponse = {
            id: (Date.now() + 2).toString(),
            content: "",
            isUser: false,
            timestamp: new Date(),
            hasChart: true,
            chartType: 'brandPriceDistribution',
            showExecutiveSummary: false,
            showSupportingCharts: false,
            showKeyInsights: false,
            currentInsightIndex: 0,
            initialResponseComplete: false,
            keyInsights: [
              "Lutron sells a wide range of products ranging from $19 to $189, establishing themselves across multiple price segments with premium positioning.",
              "BESTTEN focuses on the lower-end multiple-pack products, with unit price concentrating in the $7-12 range for budget-conscious consumers.",
              "Leviton maintains mid-range pricing between $15-45, targeting the professional contractor and DIY enthusiast markets.",
              "GE offers competitive pricing in the $12-35 range, positioning as a reliable middle-market alternative to premium brands."
            ],
            executiveSummary: "According to my memory, I'm assuming your competitors refer to the brands with the most total revenue in the last six months within the light switch category. The competitive landscape shows clear price segmentation strategies, with premium brands like Lutron commanding higher prices while value brands like BESTTEN compete on volume and affordability."
          }
        } else if (userQuestion.includes("products") && userQuestion.includes("selling")) {
          // Second question: price vs revenue
          aiResponse = {
            id: (Date.now() + 2).toString(),
            content: "",
            isUser: false,
            timestamp: new Date(),
            hasChart: true,
            chartType: 'priceVsRevenue',
            showExecutiveSummary: false,
            showSupportingCharts: false,
            showKeyInsights: false,
            currentInsightIndex: 0,
            initialResponseComplete: false,
            keyInsights: [
              "Higher-priced products ($40-80) generate disproportionately high revenue, indicating strong demand for premium features and quality.",
              "The sweet spot for volume sales appears to be in the $15-30 range, where price sensitivity meets acceptable functionality.",
              "Products above $100 show lower volume but maintain significant revenue contribution through premium positioning.",
              "Budget products under $15 compete primarily on volume, requiring scale to achieve meaningful revenue impact."
            ],
            executiveSummary: "The price-revenue analysis reveals a clear correlation between product positioning and market performance. Premium products justify higher prices through advanced features and brand trust, while mid-range products capture the largest volume segment. This suggests opportunities exist across all price tiers depending on target customer segments and value propositions."
          }
        } else if (userQuestion.includes("lutron") && userQuestion.includes("market share")) {
          // Third question: Lutron market share
          aiResponse = {
            id: (Date.now() + 2).toString(),
            content: "",
            isUser: false,
            timestamp: new Date(),
            hasChart: true,
            chartType: 'lutronPieChart',
            showExecutiveSummary: false,
            showSupportingCharts: false,
            showKeyInsights: false,
            currentInsightIndex: 0,
            initialResponseComplete: false,
            keyInsights: [
              "Premium segment ($70-$150) dominates Lutron's revenue at 45%, showcasing their successful premium brand positioning in the smart home market.",
              "High-end products ($150+) contribute 28% of revenue, indicating strong demand for Lutron's most advanced and feature-rich solutions.",
              "Mid-range segment ($30-$70) represents 22% of revenue, demonstrating Lutron's ability to compete across multiple price points.",
              "Budget segment ($0-$30) accounts for only 5% of revenue, confirming Lutron's strategic focus on value-added rather than price-competitive products."
            ],
            executiveSummary: "According to my memory, you would like to see the market share in a pie chart, representing the percentage of total revenue for the past year. Lutron's revenue distribution clearly reflects their premium positioning strategy, with 73% of revenue coming from products priced above $70, demonstrating strong brand equity and customer willingness to pay for quality and innovation."
          }
        } else {
          // Default response for other questions
          aiResponse = {
            id: (Date.now() + 2).toString(),
            content: "I've analyzed your request and prepared comprehensive insights based on the available market data.",
            isUser: false,
            timestamp: new Date(),
            keyInsights: [
              "Market analysis shows significant opportunities in the identified segments with strong growth potential.",
              "Competitive landscape reveals key differentiators that can be leveraged for strategic advantage.",
              "Customer sentiment data indicates high satisfaction levels with current product offerings.",
              "Price sensitivity analysis suggests optimal positioning strategies for maximum market penetration."
            ],
            executiveSummary: "Based on comprehensive market analysis, the data reveals strong performance indicators across multiple dimensions. Strategic recommendations focus on leveraging identified opportunities while maintaining competitive advantages in key market segments.",
            hasChart: false,
            showExecutiveSummary: false,
            showSupportingCharts: false,
            showKeyInsights: false,
            currentInsightIndex: 0,
            initialResponseComplete: false,
            insightTexts: [],
            supportingChartsLoading: false
          }
        }
      } else {
        // Handle Project 1 or other projects
        const isLutronQuery = input.toLowerCase().includes('lutron')

        if (isLutronQuery) {
          aiResponse = {
            id: (Date.now() + 2).toString(),
            content: "I'll analyze Lutron's market share across different price segments. Let me break this down for you with detailed insights.",
            isUser: false,
            timestamp: new Date(),
            keyInsights: [
              "Lutron dominates the premium segment (>$200) with 67% market share, positioning itself as the luxury choice for high-end residential and commercial applications.",
              "The mid-range segment ($100-$200) shows strong performance at 23% market share, indicating successful market penetration in the mainstream professional market.",
              "Budget segment (<$100) represents 10% market share, suggesting Lutron's strategic focus on value-added products rather than price competition.",
              "Total addressable market analysis shows Lutron captures approximately 34% of the overall smart dimmer switch market across all price segments."
            ],
            executiveSummary: "According to my memory, Lutron maintains a strong market position with clear premium positioning strategy. The company's 67% dominance in the premium segment demonstrates successful brand differentiation and customer loyalty. The balanced distribution across price segments (67% premium, 23% mid-range, 10% budget) reflects a well-executed market segmentation strategy that maximizes revenue while maintaining brand prestige.",
            hasChart: true,
            showExecutiveSummary: false,
            showSupportingCharts: false,
            showKeyInsights: false,
            currentInsightIndex: 0,
            initialResponseComplete: false,
            insightTexts: [],
            supportingChartsLoading: false
          }
        } else {
          aiResponse = {
            id: (Date.now() + 2).toString(),
            content: "I've analyzed your request and prepared comprehensive insights based on the available market data.",
            isUser: false,
            timestamp: new Date(),
            keyInsights: [
              "Market analysis shows significant opportunities in the identified segments with strong growth potential.",
              "Competitive landscape reveals key differentiators that can be leveraged for strategic advantage.",
              "Customer sentiment data indicates high satisfaction levels with current product offerings.",
              "Price sensitivity analysis suggests optimal positioning strategies for maximum market penetration."
            ],
            executiveSummary: "Based on comprehensive market analysis, the data reveals strong performance indicators across multiple dimensions. Strategic recommendations focus on leveraging identified opportunities while maintaining competitive advantages in key market segments.",
            hasChart: false,
            showExecutiveSummary: false,
            showSupportingCharts: false,
            showKeyInsights: false,
            currentInsightIndex: 0,
            initialResponseComplete: false,
            insightTexts: [],
            supportingChartsLoading: false
          }
        }
      }

      setMessages(prev => [...prev, aiResponse])

      // Trigger SSE effect chain for non-historical messages
      if (!aiResponse.isHistorical) {
        setTimeout(() => {
          onInitialResponseComplete(aiResponse.id)
        }, 1000) // Start SSE effects after 1 second
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
      icon: TrendingUp,
      title: "Market Analysis",
      description: "Analyze market trends and opportunities",
      prompt: projectId === "2" ? "At what prices are my competitors selling their products?" : "What are the key market trends in smart home lighting?"
    },
    {
      icon: BarChart3,
      title: "Competitive Intelligence",
      description: "Compare competitors and positioning",
      prompt: projectId === "2" ? "How well are the products of different prices selling?" : "How does our pricing compare to competitors?"
    },
    {
      icon: PieChart,
      title: "Lutron Analysis",
      description: "Analyze Lutron's market performance",
      prompt: "Show me the market share of each price segment of Lutron"
    },
    {
      icon: Lightbulb,
      title: "Strategic Insights",
      description: "Get actionable business insights",
      prompt: projectId === "2" ? "What opportunities exist in the premium segment?" : "What opportunities exist in the premium segment?"
    }
  ]

  const handleExampleClick = (prompt: string) => {
    setInput(prompt)
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

  return (
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
                <h1 className="text-lg font-semibold">AI Market Research Assistant</h1>
                <p className="text-sm text-gray-600">{projectName}</p>
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
                <h2 className="text-xl font-semibold mb-2">Welcome to AI Market Research</h2>
                <p className="text-gray-600 mb-8">Ask me anything about market analysis, competitive intelligence, or customer insights.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {examplePrompts.map((example, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleExampleClick(example.prompt)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <example.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{example.title}</CardTitle>
                            <CardDescription className="text-xs">{example.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
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
                                  <div className="space-y-4">
                                    {/* Render different charts based on chartType */}
                                    {message.chartType === 'useCase' && project1Data?.useCaseData && (
                                      <div className="relative">
                                        <div className="flex justify-end mb-2">
                                          <PinButton chart={{
                                            id: "use-case-analysis",
                                            title: "Use Case Analysis",
                                            projectName: "Customer Pain Points Analysis",
                                            projectId: "1",
                                            lastUpdated: "2025-05-20",
                                            autoUpdate: "weekly",
                                            type: "bar",
                                            isPinned: false
                                          }} />
                                        </div>
                                        <CategoryUseCaseBar data={project1Data.useCaseData} />
                                      </div>
                                    )}
                                    {message.chartType === 'categories' && project1Data?.negativeCategories && (
                                      <div className="relative" id="critical-categories">
                                        <div className="flex justify-end mb-2">
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
                                        <CategoryPainPointsBar data={project1Data.negativeCategories} />
                                      </div>
                                    )}
                                    {message.chartType === 'competitors' && project1Data?.competitorData && (
                                      <div className="relative">
                                        <div className="flex justify-end mb-2">
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
                                        <div>
                                          <CompetitorMatrix 
                                            data={project1Data.competitorData?.matrixData || []} 
                                            targetProducts={project1Data.competitorData?.targetProducts || []} 
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {message.chartType === 'categoryTrend' && project1Data?.categoryTrendData && (
                                      <div className="relative" id="category-trend">
                                        <div className="flex justify-end mb-2">
                                          <PinButton chart={{
                                            id: "category-trend",
                                            title: "Trend of Top Pain Points (Negative Mentions)",
                                            projectName: "Customer Pain Points Analysis",
                                            projectId: "1",
                                            lastUpdated: "2025-05-20",
                                            autoUpdate: "weekly",
                                            type: "line",
                                            isPinned: false
                                          }} />
                                        </div>
                                        <CategoryTrendLineChart data={project1Data.categoryTrendData} />
                                      </div>
                                    )}
                                    {message.chartType === 'lutron' && (
                                      <div className="space-y-4">
                                        <div className="text-sm text-gray-600 mb-4">
                                          Market share distribution across Lutron's price segments:
                                        </div>
                                        <div className="h-80 w-full">
                                          <LutronPieChart 
                                            data={getPriceSegments()}
                                            title="Lutron Price Segment Market Share"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {message.chartType === 'brandPriceDistribution' && project2Data?.dashboardData && (
                                      <div className="relative">
                                        <div className="flex justify-end mb-2">
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
                                        <PricingAnalysis 
                                          data={project2Data.dashboardData?.pricingAnalysis}
                                          productAnalysis={project2Data.dashboardData?.productAnalysis}
                                          productLists={project2Data.dashboardData?.productLists}
                                        />
                                      </div>
                                    )}
                                    {message.chartType === 'priceVsRevenue' && project2Data?.dashboardData?.productAnalysis && (
                                      <div className="relative">
                                        <div className="flex justify-end mb-2">
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
                                        <div className="space-y-4">
                                          <div className="flex gap-4 mb-4">
                                            <PriceTypeSelector onChange={setPriceType} />
                                            <MetricTypeSelector onChange={setMetricType} value={metricType} />
                                          </div>
                                          <div className="h-[600px]">
                                            <ScatterChart
                                              dimmerData={transformScatterData(
                                                project2Data.dashboardData.productAnalysis.priceVsRevenue
                                                  .find((cat: any) => cat.category === "Dimmer Switches")?.products || [],
                                                "🔆 Dimmer Switches"
                                              )}
                                              switchData={transformScatterData(
                                                project2Data.dashboardData.productAnalysis.priceVsRevenue
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
                                      </div>
                                    )}
                                    {message.chartType === 'lutronPieChart' && project2Data?.priceSegments && (
                                      <div className="relative">
                                        <div className="flex justify-end mb-2">
                                          <PinButton chart={{
                                            id: "lutron-price-segments",
                                            title: "Lutron Price Segment Market Share",
                                            projectName: "Dimmer Switch Price Analysis",
                                            projectId: "2",
                                            lastUpdated: "2025-05-17",
                                            autoUpdate: "monthly",
                                            type: "pie",
                                            isPinned: false
                                          }} />
                                        </div>
                                        <div className="h-80 w-full">
                                          <LutronPieChart 
                                            data={project2Data.priceSegments}
                                            title="Lutron Price Segment Market Share"
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

                          {/* Key Insights - Third (Independent Card) */}
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
                placeholder="Ask me about market analysis, competitive intelligence, or customer insights..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2"
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
      </div>
    </div>
  )
} 