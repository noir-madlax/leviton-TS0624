"use client"

import { useEffect, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { CategoryTrendPoint } from "@/lib/categoryTrendData"

interface CategoryTrendLineChartProps {
  data: CategoryTrendPoint[]
}

const palette = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <ul className="list-none p-0 m-0 space-y-1">
          {sortedPayload.map((pld, index) => (
            <li key={`item-${index}`} className="flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: pld.color }}></span>
              <span className="text-sm text-gray-700 flex-1">{pld.name}</span>
              <span className="text-sm font-semibold" style={{ color: pld.color }}>{pld.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

export function CategoryTrendLineChart({ data }: CategoryTrendLineChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="w-full h-[450px] flex items-center justify-center">Loading chart...</div>
  }

  if (!data || data.length === 0) {
    return <div className="w-full h-[450px] flex items-center justify-center">No data</div>
  }

  const lastMonthData = data[data.length - 1];
  const sortedCategoryKeys = Object.keys(lastMonthData)
    .filter((k) => k !== "month")
    .sort((a, b) => (lastMonthData[b] as number) - (lastMonthData[a] as number));

  const CustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    
    // Sort payload based on our sorted category keys
    const sortedPayload = sortedCategoryKeys.map(key => 
      payload.find((item: any) => item.dataKey === key)
    ).filter(Boolean);
    
    return (
      <div style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <span 
                style={{ 
                  width: '12px', 
                  height: '2px', 
                  backgroundColor: entry.color, 
                  marginRight: '5px',
                  display: 'inline-block'
                }} 
              />
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
          <YAxis label={{ value: "Negative Mentions", angle: -90, position: "insideLeft" }} />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
          <Legend 
            content={<CustomLegend />}
            verticalAlign="bottom"
            height={100}
          />
          {sortedCategoryKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={palette[idx % palette.length]}
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 