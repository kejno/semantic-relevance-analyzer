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
      <BarChart width={600} height={200} data={data}>
        <XAxis
          dataKey="name"
          label={{ value: 'Пассаж', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          domain={[0, 1]}
          label={{ value: 'Релевантность', angle: -90, position: 'insideLeft' }}
        />
        <Bar dataKey="score" isAnimationActive={false} onClick={handleBarClick}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </div>
  )
}
