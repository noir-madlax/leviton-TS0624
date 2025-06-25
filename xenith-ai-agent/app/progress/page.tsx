"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, Search, BarChart3, Users, CheckCircle, Clock, ArrowRight, Edit2, ArrowLeft, MessageSquare, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ActivityMessage {
  type: 'started' | 'completed' | 'periodic'
  message: string
}

const analysisSteps = [
  {
    id: "collecting",
    title: "Data Collection",
    description: "Gathering product listings, specifications, and pricing data",
    icon: Database,
    duration: 8000,
  },
  {
    id: "processing",
    title: "Processing Customer Reviews",
    description: "Extracting and analyzing customer feedback and ratings",
    icon: MessageSquare,
    duration: 7000,
  },
  {
    id: "extracting",
    title: "Extracting Specifications",
    description: "Organizing product features and technical specifications",
    icon: FileText,
    duration: 5000,
  }
]

export default function ProgressPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [projectName, setProjectName] = useState("New Project")
  const [isComplete, setIsComplete] = useState(false)
  const [messages, setMessages] = useState<ActivityMessage[]>([])
  const [isEditingName, setIsEditingName] = useState(false)

  const activityMessages = [
    "Starting data collection for Smart Home > Dimmer & Light Switches...",
    "Collecting product listings from marketplace...",
    "Gathering 1,250 products in Smart Home > Dimmer & Light Switches category",
    "Extracting product specifications and features",
    "Extracting Specifications completed",
    "Starting processing customer reviews...",
    "Processing Customer Reviews completed",
    "Extracting customer review data from 850,000 reviews",
    "Data collection complete! Your Smart Home > Dimmer & Light Switches dataset is ready for analysis",
  ]

  useEffect(() => {
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0
    let currentStepRef = 0

    const interval = setInterval(() => {
      elapsed += 100

      // Calculate overall progress
      const overallProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(overallProgress)

      // Determine current step
      let stepElapsed = 0
      let newCurrentStep = 0
      for (let i = 0; i < analysisSteps.length; i++) {
        if (elapsed <= stepElapsed + analysisSteps[i].duration) {
          newCurrentStep = i
          break
        }
        stepElapsed += analysisSteps[i].duration
        newCurrentStep = i + 1
      }

      if (newCurrentStep !== currentStepRef) {
        currentStepRef = newCurrentStep
        setCurrentStep(newCurrentStep)

        // Add activity log entries
        if (newCurrentStep > 0 && newCurrentStep <= analysisSteps.length) {
          const completedStep = analysisSteps[newCurrentStep - 1]
          setMessages((prev) => [...prev, { type: 'completed', message: `✓ ${completedStep.title} completed` }])
        }

        if (newCurrentStep < analysisSteps.length) {
          const currentStepData = analysisSteps[newCurrentStep]
          setMessages((prev) => [...prev, { type: 'started', message: `→ Starting ${currentStepData.title.toLowerCase()}...` }])
        }
      }

      // Add periodic updates
      if (elapsed % 2000 === 0 && newCurrentStep < analysisSteps.length) {
        const randomMessage = activityMessages[Math.floor(Math.random() * activityMessages.length)]
        setMessages((prev) => [...prev, { type: 'periodic', message: `• ${randomMessage}` }])
      }

      if (elapsed >= totalDuration) {
        setIsComplete(true)
        setMessages((prev) => [...prev, { type: 'completed', message: "✓ Data collection complete! Your Smart Home > Dimmer & Light Switches dataset is ready for analysis" }])
        
        // Mark project 2 as created and set as current project
        localStorage.setItem('project2-created', 'true')
        localStorage.setItem('current-project-id', '2')
        localStorage.removeItem('project2-in-progress')
        
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleViewResults = () => {
    router.push("/project/2/chat")
  }

  const handleNameEdit = () => {
    setIsEditingName(true)
  }

  const handleNameSave = () => {
    setIsEditingName(false)
  }

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/onboarding")}
                className="text-gray-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {isEditingName ? (
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyPress={handleNameKeyPress}
                  className="text-xl font-semibold text-gray-900 border-none p-0 h-auto bg-transparent focus:ring-0"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
                  <Button variant="ghost" size="sm" onClick={handleNameEdit} className="w-8 h-8 p-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-600">Smart Home &gt; Dimmer &amp; Light Switches</p>
            </div>
            {isComplete ? (
              <Button onClick={handleViewResults} className="bg-black hover:bg-gray-800 text-white">
                Enter
              </Button>
            ) : (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {Math.ceil((100 - progress) / 5)} min remaining
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Data Collection Progress</span>
                <span className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3 mb-4" />
              <div className="text-sm text-gray-600">
                {isComplete
                  ? "Data collection complete! Your Smart Home > Dimmer & Light Switches dataset is ready for analysis."
                  : `Currently ${analysisSteps[currentStep]?.title.toLowerCase() || "processing"}...`}
              </div>
            </CardContent>
          </Card>

          {/* Step Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisSteps.map((step, index) => {
              const isCompleted = index < currentStep || isComplete
              const isCurrent = index === currentStep && !isComplete
              const isPending = index > currentStep && !isComplete

              return (
                <Card
                  key={step.id}
                  className={`${
                    isCompleted
                      ? "border-green-200 bg-green-50"
                      : isCurrent
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isCompleted
                            ? "bg-green-100 text-green-600"
                            : isCurrent
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                      </div>
                      <Badge
                        variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {isCompleted ? "Complete" : isCurrent ? "In Progress" : "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-gray-600">{step.description}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {messages
                  .slice(-10)
                  .reverse()
                  .map((activity, index) => (
                    <div key={index} className="text-sm text-gray-600 font-mono">
                      {activity.message}
                    </div>
                  ))}
                {messages.length === 0 && <div className="text-sm text-gray-400">Starting analysis...</div>}
              </div>
            </CardContent>
          </Card>

          {/* Completion Actions */}
          {isComplete && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Data Collection Complete!</h3>
                      <p className="text-sm text-green-600">
                        Your Smart Home &gt; Dimmer &amp; Light Switches data collection is ready for analysis.
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleViewResults} size="lg" className="bg-black hover:bg-gray-800 text-white">
                    Enter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
