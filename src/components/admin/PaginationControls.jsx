export default function PaginationControls({
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  pageLabel,
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        className="btn btn-outline"
        onClick={onPrevious}
        disabled={!canPrevious}
      >
        이전
      </button>
      <span className="text-sm text-base-content/70">{pageLabel}</span>
      <button type="button" className="btn btn-outline" onClick={onNext} disabled={!canNext}>
        다음
      </button>
    </div>
  )
}
