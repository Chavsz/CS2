import React from 'react'

type Props = {
  total: number
  page: number
  pageSize: number
  onPageChange: (nextPage: number) => void
}

const Pagination: React.FC<Props> = ({ total, page, pageSize, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="flex items-center justify-between mt-3 text-sm text-gray-700">
      <div>{`Showing ${start}-${end} of ${total} entries`}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination


