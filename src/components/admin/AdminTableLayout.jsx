export default function AdminTableLayout({
  isLoading,
  isEmpty,
  emptyMessage = "데이터가 없습니다.",
  children,
  footer,
}) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : isEmpty ? (
          <p className="text-sm text-base-content/70">{emptyMessage}</p>
        ) : (
          children
        )}
        {footer ? <div className="flex flex-wrap gap-3">{footer}</div> : null}
      </div>
    </div>
  )
}
