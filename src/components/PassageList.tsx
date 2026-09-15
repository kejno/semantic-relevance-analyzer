export const HIGH_THRESHOLD = 0.7
export const LOW_THRESHOLD = 0.4

type BadgeColor = 'green' | 'yellow' | 'red'

function getBadgeColor(score: number): BadgeColor {
  if (score >= HIGH_THRESHOLD) return 'green'
  if (score >= LOW_THRESHOLD) return 'yellow'
  return 'red'
}

interface PassageCardProps {
  text: string
  score: number
  index: number
}

function PassageCard({ text, score, index }: PassageCardProps) {
  const color = getBadgeColor(score)
  const pct = Math.round(score * 100)
  return (
    <div
      data-passage-id={index}
      className="flex flex-col gap-3 py-4 text-left border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-baseline gap-3">
        <span
          className="font-serif tabular-nums text-lg shrink-0"
          style={{ fontFamily: 'var(--serif)', color: 'var(--text-h)', minWidth: '3ch' }}
          data-color={color}
        >
          {pct}%
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: 'var(--accent)', opacity: 0.35 + (score * 0.65) }}
          />
        </div>
      </div>
      <p className="text-sm" style={{ color: 'var(--text)' }}>{text}</p>
    </div>
  )
}

export interface PassageListProps {
  passages: Array<{ text: string; score: number }>
}

export function PassageList({ passages }: PassageListProps) {
  if (passages.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Введите текст и целевой запрос для анализа
      </p>
    )
  }
  return (
    <div className="flex flex-col">
      {passages.map((p, i) => (
        <PassageCard key={i} text={p.text} score={p.score} index={i} />
      ))}
    </div>
  )
}
