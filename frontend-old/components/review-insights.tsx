"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

import { CategoryPainPointsBar } from "@/components/charts/category-pain-points-bar"
import { CategoryPositiveFeedbackBar } from "@/components/charts/category-positive-feedback-bar"
import CategoryUseCaseBar from "@/components/CategoryUseCaseBar"
import { ReviewPanel } from "@/components/ui/review-panel"
import { useReviewPanel } from "@/lib/review-panel-context"
import { getReviewData, ReviewData, allReviewData } from "@/lib/reviewData"

import { getCategoryFeedback, ProductType, getTopUseCases } from "@/lib/categoryFeedback"

interface ReviewInsightsProps {
  // No props needed now as we fetch review data internally
}

export function ReviewInsights({ }: ReviewInsightsProps) {
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('dimmer')
  const [reviewData, setReviewData] = useState<any>(null)
  const reviewPanel = useReviewPanel()
  
  useEffect(() => {
    const reviewData = getReviewData()
    
    // Create the structure that charts expect
    const reviewDataForCharts = {
      ...reviewData,
      reviewsByCategory: allReviewData // This is the Record<string, Review[]> structure charts need
    }
    
    setReviewData(reviewDataForCharts)
  }, [])
  
  const categoryPainPoints = getCategoryFeedback(selectedProductType)
  const useCases = getTopUseCases(selectedProductType)

  const handleProductTypeChange = (productType: ProductType) => {
    setSelectedProductType(productType)
  }

  return (
    <div className="space-y-10">
      {/* 分类痛点分析 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-500 pl-4 mb-6">
          📊 Customer Pain Points by Category
        </h2>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            🖱️ <strong>Interactive Chart:</strong> Click on any bar to view actual customer reviews mentioning those specific issues and pain points.
          </p>
        </div>

        <CategoryPainPointsBar 
          data={categoryPainPoints.topNegativeCategories} 
          productType={selectedProductType}
          onProductTypeChange={handleProductTypeChange}
          reviewData={reviewData}
        />
      </section>

      {/* 分类正面反馈分析 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-green-500 pl-4 mb-6">
          ⭐ Customer Delights by Category
        </h2>
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            🖱️ <strong>Interactive Chart:</strong> Click on any bar to view actual customer reviews highlighting those positive aspects and strengths.
          </p>
        </div>

        <CategoryPositiveFeedbackBar 
          data={categoryPainPoints.topPositiveCategories} 
          productType={selectedProductType}
          onProductTypeChange={handleProductTypeChange}
          reviewData={reviewData}
        />
      </section>

      {/* 使用场景满意度分析 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-purple-500 pl-4 mb-6">
          🎯 Use Case Satisfaction Analysis
        </h2>
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700">
            🖱️ <strong>Interactive Chart:</strong> Click on any bar to explore customer reviews related to specific use cases and applications.
          </p>
        </div>

        <CategoryUseCaseBar 
          data={useCases} 
          title="Use Case Analysis"
          description="Bar height = mention count, color = satisfaction level (green=high, yellow=medium, red=low) - Click bars to explore reviews"
          productType={selectedProductType}
          onProductTypeChange={handleProductTypeChange}
          reviewData={reviewData}
        />
      </section>


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