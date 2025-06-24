"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquare, TrendingUp, BarChart3, PieChart, Lightbulb, Send, Loader2, X, Clock, User } from 'lucide-react'
import { LutronPieChart } from "@/components/charts/lutron-pie-chart"
import { getPriceSegments } from "@/lib/lutron-data"

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

// User memory data
const userMemories = [
  {
    id: "1",
    content: "I want to see market share data presented in pie chart format, showing percentage breakdown of total revenue for the past year",
    timestamp: "2024-01-15",
    category: "Visualization Preference"
  },
  {
    id: "2", 
    content: "Focus analysis on Lutron brand performance across different price segments",
    timestamp: "2024-01-10",
    category: "Brand Focus"
  },
  {
    id: "3",
    content: "Include competitive positioning analysis when showing market data",
    timestamp: "2024-01-08",
    category: "Analysis Scope"
  },
  {
    id: "4",
    content: "Prefer detailed executive summaries with strategic recommendations",
    timestamp: "2024-01-05",
    category: "Report Format"
  },
  {
    id: "5",
    content: "Show both volume and revenue metrics when analyzing market segments",
    timestamp: "2024-01-03",
    category: "Metrics Preference"
  }
]

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showTopics, setShowTopics] = useState(false)
  const [currentStage, setCurrentStage] = useState("")
  const [currentProgress, setCurrentProgress] = useState(0)
  const [showMemory, setShowMemory] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const executiveSummaryRef = useRef<HTMLDivElement>(null)
  const supportingChartsRef = useRef<HTMLDivElement>(null)
  const keyInsightsRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    // Step 2: Show Supporting Charts after Executive Summary completes - 3x longer delay
    setTimeout(() => {
      // First show loading state for Supporting Charts
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, showSupportingCharts: true, supportingChartsLoading: true } : msg
      ))
      setTimeout(() => scrollToSection(supportingChartsRef), 500)
      
      // Then show actual content after loading
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, supportingChartsLoading: false } : msg
        ))
        
        // Auto trigger Key Insights after 2x longer delay
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
        }, 3000) // Changed from 1500ms to 3000ms (2x longer)
      }, 1500) // Loading effect duration
    }, 1500) // Changed from 500ms to 1500ms (3x longer)
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

      const isLutronQuery = input.toLowerCase().includes('lutron')
      let aiResponse: Message

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

      setMessages(prev => [...prev, aiResponse])

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
      prompt: "What are the key market trends in smart home lighting?"
    },
    {
      icon: BarChart3,
      title: "Competitive Intelligence",
      description: "Compare competitors and positioning",
      prompt: "How does our pricing compare to competitors?"
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
      prompt: "What opportunities exist in the premium segment?"
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
    const parts = text.split("According to my memory")
    if (parts.length === 1) {
      return (
        <TypewriterText 
          text={text} 
          speed={10} 
          className="text-gray-700 leading-relaxed"
          onComplete={() => onExecutiveSummaryComplete(messageId)}
        />
      )
    }

    return (
      <span className="text-gray-700 leading-relaxed">
        <TypewriterText text={parts[0]} speed={10} />
        <Sheet open={showMemory} onOpenChange={setShowMemory}>
          <SheetTrigger asChild>
            <button className="text-blue-600 hover:text-blue-800 underline font-medium">
              According to my memory
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Memory</span>
              </SheetTitle>
              <SheetDescription>
                Your previous preferences and requirements that I remember
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)] mt-6">
              <div className="space-y-4">
                {userMemories.map((memory) => (
                  <Card key={memory.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {memory.category}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {memory.timestamp}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {memory.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <TypewriterText 
          text={parts[1]} 
          speed={10} 
          onComplete={() => onExecutiveSummaryComplete(messageId)}
        />
      </span>
    )
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
                onClick={() => setShowTopics(!showTopics)}
                className="text-gray-600"
              >
                <MessageSquare className="h-4 w-4" />
                Topics
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <h1 className="text-lg font-semibold">AI Market Research Assistant</h1>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
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
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-3xl ${message.isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      {message.isUser ? (
                        <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-gray-600 text-white">AI</AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`flex-1 ${message.isUser ? 'mr-3' : 'ml-3'}`}>
                      {message.isAnalyzing ? (
                        <AnalyzingLoader stage={currentStage} progress={currentProgress} />
                      ) : (
                        <div className={`p-4 rounded-lg ${message.isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>
                          <TypewriterText 
                            text={message.content}
                            speed={message.isUser ? 0 : 10}
                            className={message.isUser ? 'text-white' : 'text-gray-900'}
                            onComplete={() => !message.isUser && onInitialResponseComplete(message.id)}
                          />
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
                                {renderExecutiveSummaryWithMemoryLink(message.executiveSummary || "", message.id)}
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
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    No specific charts available for this analysis. The insights above provide comprehensive coverage of the requested information.
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Key Insights - Third */}
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
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about market analysis, competitive intelligence, or customer insights..."
                  className="min-h-[60px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 bg-blue-600 hover:bg-blue-700"
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