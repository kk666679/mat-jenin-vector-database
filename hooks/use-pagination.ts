import { useState, useCallback, useMemo } from 'react'

/**
 * Hook for managing pagination state
 */
export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  total?: number
}

export interface UsePaginationReturn {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
  offset: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirst: () => void
  goToLast: () => void
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { 
    initialPage = 1, 
    initialPageSize = 10, 
    total = 0 
  } = options

  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize)
  }, [total, pageSize])

  const hasMore = useMemo(() => {
    return page < totalPages
  }, [page, totalPages])

  const offset = useMemo(() => {
    return (page - 1) * pageSize
  }, [page, pageSize])

  const setPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages || 1))
    setPageState(validPage)
  }, [totalPages])

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize)
    setPageState(1) // Reset to first page when page size changes
  }, [])

  const nextPage = useCallback(() => {
    if (hasMore) {
      setPageState((prev) => prev + 1)
    }
  }, [hasMore])

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(1, prev - 1))
  }, [])

  const goToFirst = useCallback(() => {
    setPageState(1)
  }, [])

  const goToLast = useCallback(() => {
    setPageState(totalPages)
  }, [totalPages])

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasMore,
    offset,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
  }
}

