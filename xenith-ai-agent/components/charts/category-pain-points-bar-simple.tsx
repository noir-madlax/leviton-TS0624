"use client"

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CategoryFeedback, ProductType } from '@/lib/categoryFeedback'
import { getSatisfactionColor } from '@/lib/satisfactionColors'

interface CategoryPainPointsBarSimpleProps {
  data: CategoryFeedback[]
  productType?: ProductType
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-800 text-sm">{data.category}</p>
        <p className="text-xs text-red-600 font-semibold">Negative Reviews: {data.negativeCount}</p>
        <p className="text-xs text-green-600">Satisfaction: {data.satisfactionRate}%</p>
      </div>
    )
  }
  return null
}

export function CategoryPainPointsBarSimple({ data, productType = 'dimmer' }: CategoryPainPointsBarSimpleProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getBarColor = (item: CategoryFeedback) => {
    return getSatisfactionColor(item.satisfactionRate)
  }

  const filteredData = data.slice(0, 10)

  if (!isMounted) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filteredData}
          margin={{
            top: 10,
            right: 20,
            left: 60,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            fontSize={10}
          />
          <YAxis
            label={{ 
              value: 'Negative Reviews', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' }
            }}
            fontSize={10}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="negativeCount" 
            radius={[2, 2, 0, 0]}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 