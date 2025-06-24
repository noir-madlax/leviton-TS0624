"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  Filter,
  RefreshCw,
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
    ],
  },
  {
    id: "beauty-personal-care",
    name: "Beauty & Personal Care",
    icon: Sparkles,
    subcategories: [
      "Makeup",
      "Skin Care",
      "Hair Care",
      "Fragrance",
      "Oral Care",
      "Shaving & Hair Removal",
      "Personal Care",
      "Foot, Hand & Nail Care",
    ],
  },
  {
    id: "baby",
    name: "Baby",
    icon: Baby,
    subcategories: [
      "Diapering",
      "Feeding",
      "Baby & Toddler Toys",
      "Baby Care",
      "Nursery",
      "Strollers & Accessories",
      "Car Seats & Accessories",
      "Baby & Toddler Clothing",
    ],
  },
  {
    id: "arts-crafts-sewing",
    name: "Arts, Crafts & Sewing",
    icon: Palette,
    subcategories: [
      "Painting, Drawing & Art Supplies",
      "Beading & Jewelry Making",
      "Crafting",
      "Fabric",
      "Knitting & Crochet",
      "Needlework",
      "Organization, Storage & Transport",
      "Printmaking",
      "Scrapbooking & Stamping",
      "Sewing",
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
      "RV Parts & Accessories",
      "Tires & Wheels",
      "Tools & Equipment",
    ],
  },
  {
    id: "industrial-scientific",
    name: "Industrial & Scientific",
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

// Detail filter data (based on the second image)
const detailFilterData = {
  dataSources: [
    { id: "amazon", name: "Amazon", checked: true },
    { id: "home-depot", name: "Home Depot", checked: true },
  ],
  topBrands: [
    { id: "lutron", name: "Lutron", percentage: 49 },
    { id: "leviton", name: "Leviton", percentage: 26 },
    { id: "ge", name: "GE", percentage: 10 },
    { id: "legrand", name: "Legrand", percentage: 4 },
    { id: "bestten", name: "BESTTEN", percentage: 4 },
  ],
  salesRanking: {
    filter: "Top 100 Products",
    description: "Based on monthly sales volume"
  },
  sampleData: {
    products: 225,
    brands: 9,
    reviews: 228011,
    avgSalesPerMonth: 337
  }
}

export default function OnboardingPage() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([])
  const [selectedCharts, setSelectedCharts] = useState<string[]>(["brand-price-distribution", "revenue-analysis"])
  const [detailFilters, setDetailFilters] = useState(detailFilterData)
  const [showDetailFilter, setShowDetailFilter] = useState(false)
  const router = useRouter()

  // Refs for scroll anchoring
  const subcategoryRef = useRef<HTMLDivElement>(null)
  const productTypesRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<HTMLDivElement>(null)

  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory)

  // Scroll to element with smooth animation
  const scrollToElement = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start",
        inline: "nearest"
      })
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory("") // Reset subcategory when category changes
    
    // Scroll to subcategory section after a short delay
    setTimeout(() => {
      scrollToElement(subcategoryRef)
    }, 300)
  }

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory)
    
    // Scroll to product types section if it's smart home, otherwise scroll to charts
    setTimeout(() => {
      if (selectedCategory === "smart-home") {
        scrollToElement(productTypesRef)
      } else {
        scrollToElement(chartsRef)
      }
    }, 300)
  }

  const handleProductTypeToggle = (productTypeId: string) => {
    setSelectedProductTypes(prev => 
      prev.includes(productTypeId) 
        ? prev.filter(id => id !== productTypeId)
        : [...prev, productTypeId]
    )
    
    // Scroll to charts section when product type selection changes
    if (selectedProductTypes.length === 0) {
      setTimeout(() => {
        scrollToElement(chartsRef)
      }, 300)
    }
  }

  const handleChartToggle = (chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    )
  }

  const handleDetailFilterChange = (category: string, id: string) => {
    setDetailFilters(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].map((item: any) => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }))
  }

  const resetDetailFilters = () => {
    setDetailFilters(detailFilterData)
  }

  const applyDetailFilters = () => {
    setShowDetailFilter(false)
    // Here you would typically update the main data based on filters
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
            <Card ref={subcategoryRef} className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <selectedCategoryData.icon className="w-5 h-5 text-blue-600" />
                  <span>Select {selectedCategoryData.name} Subcategory</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
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

                    {/* Product Type Selection and Chart Selection - Removed as per user request */}

          {/* Data Preview */}
          {selectedCategory && selectedSubcategory && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="text-green-800">Selected Data Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Preview of your research dataset. Your analysis project will be based on this filtered selection.
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">225</div>
                    <div className="text-xs text-gray-600">Products</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">9</div>
                    <div className="text-xs text-gray-600">Brands</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">228,011</div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-green-100 rounded-lg">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Clock className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-green-800">Estimated Processing Time</div>
                    <div className="text-xs text-green-600">3-7 minutes</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-200">
                  <div className="flex justify-end">
                    <Button onClick={handleStartAnalysis} size="lg" className="bg-black hover:bg-gray-800 text-white">
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
