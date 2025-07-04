"use client"

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryFeedback, ProductType } from '@/lib/categoryFeedback'
import { ComplaintLegend } from '@/lib/satisfactionColors'
import { useReviewPanel } from '@/lib/review-panel-context'

interface CategoryPainPointsBarProps {
  data: CategoryFeedback[]
  productType?: ProductType
  onProductTypeChange?: (productType: ProductType) => void
  reviewData?: {
    reviewsByCategory?: Record<string, any[]>
  }
}

export function CategoryPainPointsBar({ data, productType = 'dimmer', onProductTypeChange, reviewData }: CategoryPainPointsBarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedProductType, setSelectedProductType] = useState<ProductType>(productType)
  const { openPanel } = useReviewPanel()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 同步外部的productType变化
  useEffect(() => {
    setSelectedProductType(productType)
  }, [productType])

  // dynamic thresholds based on dataset distribution
  const satisfactionRates = data.map(d => d.satisfactionRate).sort((a,b)=>a-b)
  let poorThreshold = 50, averageThreshold = 65
  if (satisfactionRates.length >= 3) {
    poorThreshold = satisfactionRates[Math.floor(satisfactionRates.length/3)]
    averageThreshold = satisfactionRates[Math.floor((satisfactionRates.length*2)/3)]
  }

  const getBarColor = (item: CategoryFeedback): string => {
    const rate = item.satisfactionRate
    if (rate >= averageThreshold) return '#fbbf24'
    if (rate >= poorThreshold) return '#f97316'
    return '#dc2626'
  }

  // 数据已经按负面评价数排序，直接使用前10个
  const filteredData = data.slice(0, 10)

  const handleProductTypeChange = (value: ProductType) => {
    setSelectedProductType(value)
    if (onProductTypeChange) {
      onProductTypeChange(value)
    }
  }

    const handleBarClick = (data: any, index: number) => {
    if (data && data.category && reviewData?.reviewsByCategory) {
      const categoryName = data.category
      const reviews = reviewData.reviewsByCategory[categoryName] || []
      
      if (reviews.length > 0) {
        openPanel(
          reviews,
          `${categoryName} - Customer Reviews`,
          `Reviews mentioning "${categoryName}" issues and experiences`,
          { sentiment: true, brand: true, rating: true, verified: true }
        )
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Top 10 Most Critical Pain Points by Negative Mentions 🖱️
          <ComplaintLegend />
        </CardTitle>
        <div className="flex items-center justify-between">
          <CardDescription>Categories ranked by absolute negative review count</CardDescription>
          {onProductTypeChange && (
            <div className="flex gap-2">
              <Button
                variant={selectedProductType === 'dimmer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProductTypeChange('dimmer')}
              >
                Dimmer Switches
              </Button>
              <Button
                variant={selectedProductType === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProductTypeChange('light')}
              >
                Light Switches
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isMounted ? (
          <div className="h-[450px] w-full flex items-center justify-center">
            Loading chart...
          </div>
        ) : (
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 80,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis
                label={{
                  value: 'Negative Mentions',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -10,
                  dy: 40,
                }}
                fontSize={12}
              />
              <Tooltip content={({active,payload,label}:any)=>{
                if(active && payload && payload.length){
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                      <p className="font-semibold text-gray-800">{data.category}</p>
                      <p className="text-sm text-gray-600">Type: {data.categoryType}</p>
                      <p className="text-sm font-semibold" style={{color:getBarColor(data)}}>Negative Reviews: {data.negativeCount}</p>
                      <p className="text-sm text-green-600">Satisfaction Rate: {data.satisfactionRate}%</p>
                    </div>
                  )
                }
                return null
              }} />
              <Bar 
                dataKey="negativeCount" 
                radius={[4, 4, 0, 0]} 
                style={{ cursor: 'pointer' }}
                onClick={handleBarClick}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
        
        {/* 统计摘要 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {filteredData.slice(0, 4).map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold" style={{color: getBarColor(item)}}>
                {item.negativeCount}
              </div>
              <div className="text-sm text-gray-600 truncate" title={item.category}>
                {item.category}
              </div>
              <div className="text-xs" style={{color: getBarColor(item)}}>
                {item.satisfactionRate}% satisfaction
              </div>
            </div>
          ))}
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Categories</p>
            <p className="text-lg font-semibold">{data.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Negative Rate</p>
            <p className="text-lg font-semibold">
              {data.length > 0 ? 
                Math.round(data.reduce((sum, item) => sum + item.negativeRate, 0) / data.length) : 0
              }%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Negative</p>
            <p className="text-lg font-semibold text-red-600">
              {data.reduce((sum, item) => sum + item.negativeCount, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Critical Issues</p>
            <p className="text-lg font-semibold text-red-600">
              {data.filter(item => item.negativeCount >= 30).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 