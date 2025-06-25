"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { useMemo } from "react"

interface GroupedBarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  yAxisLabel?: string
  xAxisLabel?: string
  metricType?: "revenue" | "volume"
  onBarClick?: (data: any) => void
  title?: string
}

export function GroupedBarChart({
  data,
  index,
  categories,
  colors = ["#3498DB", "#95A5A6"],
  yAxisLabel,
  xAxisLabel,
  metricType = "revenue",
  onBarClick,
  title,
}: GroupedBarChartProps) {
  const formatValue = (value: number) => {
    return metricType === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString()
  }

  // Calculate dynamic margins based on longest label
  const { bottomMargin, xAxisLabelOffset } = useMemo(() => {
    if (!data.length) return { bottomMargin: 120, xAxisLabelOffset: -10 }

    // Find the longest label (considering wrapped text)
    const longestLabel = data.reduce((longest, item) => {
      const labelText = String(item[index])
      const lines = labelText.split('\n')
      const maxLineLength = Math.max(...lines.map(line => line.length))
      return maxLineLength > longest ? maxLineLength : longest
    }, 0)

    // Calculate required space for rotated labels
    const estimatedLabelHeight = Math.max(30, longestLabel * 0.6 * 7) // Adjusted for smaller font

    // Reduced spacing
    const baseMargin = 40
    const labelSpace = Math.max(40, estimatedLabelHeight)
    const xAxisLabelSpace = 25

    const totalBottomSpace = baseMargin + labelSpace + xAxisLabelSpace

    return {
      bottomMargin: Math.min(totalBottomSpace, 120), // Reduced max
      xAxisLabelOffset: -15,
    }
  }, [data, index])

  // Function to lighten a color
  const lightenColor = (color: string, amount: number = 0.3) => {
    // Remove # if present
    const hex = color.replace('#', '')

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Lighten each component
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount))
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount))
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount))

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  // Custom tick component for wrapped text
  const CustomTick = (props: any) => {
    const { x, y, payload } = props
    const textValue = String(payload.value ?? '')
    const lines = textValue.split('\n')

    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line: string, lineIndex: number) => (
          <text
            key={lineIndex}
            x={0}
            y={lineIndex * 14}
            dy={16}
            textAnchor="end"
            fill="#666"
            fontSize="13"
            transform="rotate(-45)"
          >
            {line}
          </text>
        ))}
      </g>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {title && (
        <div className="text-center font-semibold mb-2 text-lg">{title}</div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap="10%"
          margin={{
            top: 20,
            right: 30,
            left: 100, // Increased to prevent Y-axis overlap
            bottom: bottomMargin,
          }}
          onClick={onBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={index}
            interval={0}
            tick={<CustomTick />}
            height={bottomMargin - 25}
            label={{
              value: xAxisLabel,
              position: "insideBottom",
              offset: xAxisLabelOffset,
              style: { textAnchor: 'middle', fontSize: '16px', fontWeight: 'bold' }
            }}
          />
          <YAxis
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: 'middle', fontSize: '16px', fontWeight: 'bold' }
            }}
            tickFormatter={formatValue}
            tick={{ fontSize: 14 }}
            width={90} // Fixed width to prevent overlap
          />
          <Tooltip
            formatter={(value) => [formatValue(Number(value)), metricType === "revenue" ? 'Revenue' : 'Volume']}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const dataIndex = data.findIndex(item => item.name === label)
                const itemColor = colors[dataIndex % colors.length]
                const lightColor = lightenColor(itemColor, 0.4)

                return (
                  <div
                    style={{
                      backgroundColor: lightColor,
                      border: `2px solid ${itemColor}`,
                      borderRadius: '6px',
                      padding: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      width: '33vw',
                      maxWidth: '400px',
                      minWidth: '250px'
                    }}
                  >
                    <p style={{
                      color: '#333',
                      fontWeight: 'bold',
                      margin: '0 0 6px 0',
                      wordWrap: 'break-word',
                      lineHeight: '1.4'
                    }}>
                      {label}
                    </p>
                    <p style={{ color: '#333', margin: 0 }}>
                      {metricType === "revenue" ? "Revenue" : "Volume"}: {formatValue(Number(payload[0].value))}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="value"
            maxBarSize={80}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, entryIndex) => (
              <Cell key={`cell-${entryIndex}`} fill={colors[entryIndex % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 