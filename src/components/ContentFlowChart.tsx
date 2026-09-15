import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts'
import { HIGH_THRESHOLD, LOW_THRESHOLD } from './PassageList'

const BAR_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
} as const

function getBarColor(score: number): string {
  if (score >= HIGH_THRESHOLD) return BAR_COLORS.green
  if (score >= LOW_THRESHOLD) return BAR_COLORS.yellow
  return BAR_COLORS.red
}

export interface ContentFlowChartProps {
  passages: Array<{ text: string; score: number }>
}

export function ContentFlowChart({ passages }: ContentFlowChartProps) {
  if (passages.length < 2) return null

  const data = passages.map((p, i) => ({
    name: `Пассаж ${i + 1}`,
    score: p.score,
  }))

  const handleBarClick = (_entry: unknown, index: number) => {
    document.querySelector(`[data-passage-id="${index}"]`)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <BarChart width={648} height={220} data={data} margin={{ top: 8, right: 8, bottom: 20, left: 16 }}>
        <XAxis
          dataKey="name"
          label={{ value: 'Пассаж', position: 'insideBottom', offset: -12, fontSize: 12, fill: 'var(--text)' }}
          tick={{ fontSize: 12, fill: 'var(--text)' }}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 1]}
          label={{ value: 'Релевантность', angle: -90, position: 'insideLeft', dx: -16, fontSize: 12, fill: 'var(--text)' }}
          tickFormatter={v => `${Math.round(v * 100)}%`}
          tick={{ fontSize: 12, fill: 'var(--text)' }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Bar dataKey="score" isAnimationActive={false} onClick={handleBarClick} radius={[3, 3, 0, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.score)} className="cursor-pointer" />
          ))}
        </Bar>
      </BarChart>
    </div>
  )
}
