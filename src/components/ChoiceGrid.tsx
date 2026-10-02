import type { ChoiceFeedback } from '../hooks/useChoiceRound'

interface ChoiceGridProps<T> {
  options: readonly T[]
  feedback: ChoiceFeedback | null
  getKey: (item: T) => string
  getLabel: (item: T) => string
  onSelect: (item: T) => void
}

export function ChoiceGrid<T>({ options, feedback, getKey, getLabel, onSelect }: ChoiceGridProps<T>) {
  return (
    <div className="choices">
      {options.map((option) => {
        const k = getKey(option)
        let state = ''
        if (feedback) {
          if (k === feedback.correctKey) state = ' choice--correct'
          else if (k === feedback.selectedKey) state = ' choice--wrong'
        }
        return (
          <button
            key={k}
            type="button"
            className={`choice${state}`}
            disabled={feedback !== null}
            onClick={() => onSelect(option)}
          >
            {getLabel(option)}
          </button>
        )
      })}
    </div>
  )
}
