"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Clock,
  Database,
  BarChart3,
  Users,
  ChevronRight,
  Shirt,
  ShoppingCart,
  Book,
  Music,
  Smartphone,
  Monitor,
  Home,
  Wrench,
  Heart,
  Apple,
  Sparkles,
  Baby,
  Palette,
  Dumbbell,
  Car,
  Microscope,
  Lightbulb,
  ToggleLeft,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const categories = [
  {
    id: "clothing-shoes-jewelry",
    name: "Clothing, Shoes, Jewelry & Watches",
    icon: Shirt,
    subcategories: [
      "Women's Clothing",
      "Men's Clothing",
      "Girls' Clothing",
      "Boys' Clothing",
      "Women's Shoes",
      "Men's Shoes",
      "Girls' Shoes",
      "Boys' Shoes",
      "Jewelry",
      "Watches",
      "Luggage & Travel Gear",
    ],
  },
  {
    id: "amazon-fresh",
    name: "Amazon Fresh",
    icon: ShoppingCart,
    subcategories: [
      "Fresh Produce",
      "Dairy & Eggs",
      "Meat & Seafood",
      "Bakery",
      "Frozen Foods",
      "Pantry Staples",
      "Beverages",
      "Snacks",
    ],
  },
  {
    id: "whole-foods",
    name: "Whole Foods Market",
    icon: Apple,
    subcategories: [
      "Organic Produce",
      "Natural & Organic",
      "Prepared Foods",
      "Bakery",
      "Meat & Poultry",
      "Seafood",
      "Dairy",
      "Supplements",
    ],
  },
  {
    id: "books",
    name: "Books",
    icon: Book,
    subcategories: [
      "Literature & Fiction",
      "Mystery & Suspense",
      "Science Fiction & Fantasy",
      "Romance",
      "Business & Money",
      "Health & Fitness",
      "History",
      "Children's Books",
      "Textbooks",
      "Comics & Graphic Novels",
    ],
  },
  {
    id: "movies-music-games",
    name: "Movies, Music & Games",
    icon: Music,
    subcategories: [
      "Movies & TV",
      "Music CDs & Vinyl",
      "Digital Music",
      "Video Games",
      "PC Games",
      "Gaming Accessories",
      "Musical Instruments",
      "Entertainment Collectibles",
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: Smartphone,
    subcategories: [
      "Cell Phones & Accessories",
      "Headphones",
      "TV & Video",
      "Camera & Photo",
      "Audio & Home Theater",
      "Portable Audio",
      "Car Electronics",
      "Wearable Technology",
    ],
  },
  {
    id: "computers",
    name: "Computers",
    icon: Monitor,
    subcategories: [
      "Laptops",
      "Desktop Computers",
      "Tablets",
      "Computer Accessories",
      "Monitors",
      "Networking Products",
      "Data Storage",
      "Printers & Scanners",
    ],
  },
  {
    id: "smart-home",
    name: "Smart Home",
    icon: Home,
    subcategories: [
      "Amazon Smart Home",
      "Works with Alexa Devices",
      "Smart Home Lighting",
      "Dimmer & Light Switches",
      "Smart Locks and Entry",
      "Security Cameras and Systems",
      "Plugs and Outlets",
      "New Smart Devices",
      "Heating and Cooling",
      "Detectors and Sensors",
      "Home Entertainment",
      "Pet",
      "Voice Assistants and Hubs",
      "Kitchen",
      "Vacuums and Mops",
      "Lawn and Garden",
      "WIFI and Networking",
      "Other Solutions",
    ],
  },
  {
    id: "home-garden-tools",
    name: "Home, Garden & Tools",
    icon: Wrench,
    subcategories: [
      "Kitchen & Dining",
      "Bedding & Bath",
      "Furniture",
      "Home Décor",
      "Garden & Outdoor",
      "Tools & Hardware",
      "Dimmer & Light Switches",
      "Appliances",
      "Storage & Organization",
    ],
  },
  {
    id: "pet-supplies",
    name: "Pet Supplies",
    icon: Heart,
    subcategories: [
      "Dog Supplies",
      "Cat Supplies",
      "Fish & Aquatic Pets",
      "Bird Supplies",
      "Small Animal Supplies",
      "Reptile & Amphibian",
      "Horse Supplies",
      "Pet Health & Wellness",
    ],
  },
  {
    id: "food-grocery",
    name: "Food & Grocery",
    icon: ShoppingCart,
    subcategories: [
      "Beverages",
      "Snack Foods",
      "Pantry Staples",
      "Breakfast Foods",
      "Candy & Chocolate",
      "Cooking & Baking",
      "International Foods",
      "Organic & Natural",
    ],
  },
  {
    id: "beauty-health",
    name: "Beauty & Health",
    icon: Sparkles,
    subcategories: [
      "Skincare",
      "Makeup",
      "Hair Care",
      "Fragrance",
      "Personal Care",
      "Health & Wellness",
      "Vitamins & Supplements",
      "Medical Supplies",
    ],
  },
  {
    id: "toys-kids-baby",
    name: "Toys, Kids & Baby",
    icon: Baby,
    subcategories: [
      "Toys & Games",
      "Baby Products",
      "Kids' Furniture",
      "School & Educational Supplies",
      "Baby & Toddler Toys",
      "Action Figures",
      "Dolls & Accessories",
      "Building Toys",
    ],
  },
  {
    id: "handmade",
    name: "Handmade",
    icon: Palette,
    subcategories: [
      "Handmade Jewelry",
      "Handmade Home & Kitchen",
      "Handmade Clothing",
      "Handmade Artwork",
      "Handmade Accessories",
      "Handmade Baby Products",
      "Handmade Pet Supplies",
      "Handmade Gifts",
    ],
  },
  {
    id: "sports-outdoors",
    name: "Sports & Outdoors",
    icon: Dumbbell,
    subcategories: [
      "Exercise & Fitness",
      "Outdoor Recreation",
      "Sports & Fitness",
      "Team Sports",
      "Water Sports",
      "Winter Sports",
      "Hunting & Fishing",
      "Golf",
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    icon: Car,
    subcategories: [
      "Car Care",
      "Car Electronics & Accessories",
      "Exterior Accessories",
      "Interior Accessories",
      "Lights & Lighting Accessories",
      "Motorcycle & Powersports",
      "Oils & Fluids",
      "Paint & Body Repair",
      "Replacement Parts",
      "Tools & Equipment",
    ],
  },
  {
    id: "industrial-scientific",
    name: "Industrial and Scientific",
    icon: Microscope,
    subcategories: [
      "Abrasive & Finishing Products",
      "Additive Manufacturing Products",
      "Commercial Door Products",
      "Cutting Tools",
      "Fasteners",
      "Filtration",
      "Food Service Equipment",
      "Industrial Hardware",
      "Lab & Scientific Products",
      "Material Handling Products",
      "Occupational Health & Safety Products",
      "Power & Hand Tools",
    ],
  },
]

// Available chart types
const availableCharts = [
  { id: "critical-categories", name: "Top 10 Most Critical Categories", description: "Categories with highest negative reviews" },
  { id: "use-case-analysis", name: "Use Case Analysis", description: "Customer usage patterns and preferences" },
  { id: "competitor-matrix", name: "Competitor Delights and Pain Points Matrix", description: "Competitive landscape analysis" },
  { id: "brand-price-distribution", name: "Brand Price Distribution by Category", description: "Price positioning across brands" },
  { id: "revenue-analysis", name: "Top 20 Products by Revenue", description: "Highest performing products" },
]

// Product types for switch products
const productTypes = [
  { id: "light-switch", name: "Light Switch", icon: Lightbulb },
  { id: "dimmer-switch", name: "Dimmer Switch", icon: ToggleLeft },
]

export default function OnboardingPage() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([])
  const [selectedCharts, setSelectedCharts] = useState<string[]>(["brand-price-distribution", "revenue-analysis"])
  const router = useRouter()

  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory)

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory("") // Reset subcategory when category changes
  }

  const handleProductTypeToggle = (productTypeId: string) => {
    setSelectedProductTypes(prev => 
      prev.includes(productTypeId) 
        ? prev.filter(id => id !== productTypeId)
        : [...prev, productTypeId]
    )
  }

  const handleChartToggle = (chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    )
  }

  const handleStartAnalysis = () => {
    // Simply mark that project 2 is being created
    localStorage.setItem('project2-in-progress', 'true')
    
    // In a real app, this would start the data collection process
    router.push("/progress")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">New Project</h1>
          </div>
          <Badge variant="outline">Step 1 of 2</Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What shall we work on next?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Xenith will gather listings, specs, pricing, and reviews for products in the selected category.
              </p>
            </div>
          </div>

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Select a Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product category..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <category.icon className="w-4 h-4" />
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">({category.subcategories.length} subcategories)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Subcategory Selection */}
          {selectedCategoryData && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <selectedCategoryData.icon className="w-5 h-5 text-blue-600" />
                  <span>Select {selectedCategoryData.name} Subcategory</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                                      <SelectTrigger>
                      <SelectValue placeholder="Choose a specific subcategory..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                    {selectedCategoryData.subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {selectedCategoryData.name} {">"} {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Product Type Selection - Only show for Smart Home category */}
          {selectedCategory === "smart-home" && selectedSubcategory && (
            <Card className="border-purple-200 bg-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ToggleLeft className="w-5 h-5 text-purple-600" />
                  <span>Select Product Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Choose the types of switch products to analyze:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {productTypes.map((productType) => (
                      <div key={productType.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-white/50 transition-colors">
                        <Checkbox
                          id={productType.id}
                          checked={selectedProductTypes.includes(productType.id)}
                          onCheckedChange={() => handleProductTypeToggle(productType.id)}
                        />
                        <productType.icon className="w-4 h-4 text-purple-600" />
                        <label htmlFor={productType.id} className="text-sm font-medium cursor-pointer flex-1">
                          {productType.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart Selection */}
          {selectedCategory && selectedSubcategory && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Select Charts to Generate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Choose which charts and analyses to include in your project:</p>
                  <div className="space-y-3">
                    {availableCharts.map((chart) => (
                      <div key={chart.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-white/50 transition-colors">
                        <Checkbox
                          id={chart.id}
                          checked={selectedCharts.includes(chart.id)}
                          onCheckedChange={() => handleChartToggle(chart.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={chart.id} className="text-sm font-medium cursor-pointer block">
                            {chart.name}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">{chart.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Preview */}
          {selectedCategory && selectedSubcategory && selectedCharts.length > 0 && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="text-green-800">Data Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Database className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Product Data</div>
                      <div className="text-xs text-gray-600">~1,200-2,500 products</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Customer Reviews</div>
                      <div className="text-xs text-gray-600">~15,000-50,000 reviews</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Estimated Processing Time</div>
                      <div className="text-xs text-gray-600">15-20 minutes</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-200">
                  <div className="flex justify-end">
                    <Button onClick={handleStartAnalysis} size="lg" className="bg-green-600 hover:bg-green-700">
                      Start Data Collection
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
