export const HIGH_THRESHOLD = 0.7
export const LOW_THRESHOLD = 0.4

type BadgeColor = 'green' | 'yellow' | 'red'

function getBadgeColor(score: number): BadgeColor {
  if (score >= HIGH_THRESHOLD) return 'green'
  if (score >= LOW_THRESHOLD) return 'yellow'
  return 'red'
}

const BADGE_CLASSES: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
}

interface PassageCardProps {
  text: string
  score: number
  index: number
}

function PassageCard({ text, score, index }: PassageCardProps) {
  const color = getBadgeColor(score)
  return (
    <div
      data-passage-id={index}
      className="flex flex-col gap-2 rounded border p-4"
      style={{ borderColor: 'var(--border)' }}
    >
      <p className="text-sm" style={{ color: 'var(--text-h)' }}>{text}</p>
      <span
        className={`self-start px-2 py-0.5 rounded text-xs font-semibold ${BADGE_CLASSES[color]}`}
        data-color={color}
      >
        {Math.round(score * 100)}%
      </span>
    </div>
  )
}

export interface PassageListProps {
  passages: Array<{ text: string; score: number }>
}

export function PassageList({ passages }: PassageListProps) {
  if (passages.length === 0) {
    return (
      <p className="text-sm text-center" style={{ color: 'var(--text)' }}>
        Введите текст и целевой запрос для анализа
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {passages.map((p, i) => (
        <PassageCard key={i} text={p.text} score={p.score} index={i} />
      ))}
    </div>
  )
}
