"use client"

import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface LutronPieChartProps {
  data: {
    name: string
    value: number
  }[]
  title?: string
  colors?: string[]
  annotation?: string
}

export function LutronPieChart({ data, title, colors = ["#E67E22", "#3498DB", "#9B59B6", "#2ECC71", "#F39C12"], annotation }: LutronPieChartProps) {
  
  const handleSliceClick = (data: any) => {
    // Log the click for now
    console.log('Pie slice clicked:', data)
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReChartsPie
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 30,
          bottom: 20,
        }}
      >
        <text x="50%" y="20" textAnchor="middle" dominantBaseline="middle" className="text-base font-medium">
          {title}
        </text>
        {annotation && (
          <text x="10%" y="10%" width={100} className="text-xs" style={{ fill: "#333", fontWeight: "500" }}>
            {annotation.split("\n").map((line, i) => (
              <tspan key={i} x="10%" dy={i === 0 ? 0 : 15}>
                {line}
              </tspan>
            ))}
          </text>
        )}
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          onClick={handleSliceClick}
          style={{ cursor: 'pointer' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        <Legend />
      </ReChartsPie>
    </ResponsiveContainer>
  )
} 