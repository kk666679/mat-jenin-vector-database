import { useState, useCallback, useEffect } from 'react'
import type { Document, DocumentStatus } from '@/types'

/**
 * Hook for managing documents
 */
export interface UseDocumentsOptions {
  initialDocuments?: Document[]
  tenantId?: string
}

export interface UseDocumentsReturn {
  documents: Document[]
  loading: boolean
  error: string | null
  fetchDocuments: () => Promise<void>
  uploadDocument: (title: string, file: File) => Promise<Document | null>
  deleteDocument: (id: string) => Promise<boolean>
  getDocumentById: (id: string) => Document | undefined
}

export function useDocuments(options: UseDocumentsOptions = {}): UseDocumentsReturn {
  const { initialDocuments = [], tenantId = 'default-tenant' } = options
  
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all documents
   */
  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/documents', {
        headers: {
          'x-tenant-id': tenantId,
        },
      })
      
      const data = await res.json()

      if (data.success) {
        setDocuments(data.data.items)
      } else {
        throw new Error(data.error || 'Failed to fetch documents')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  /**
   * Upload a new document
   */
  const uploadDocument = useCallback(async (title: string, file: File): Promise<Document | null> => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('file', file)

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
        },
        body: formData,
      })
      
      const data = await res.json()

      if (data.success) {
        const newDoc: Document = {
          id: data.data.id,
          title: data.data.title,
          status: data.data.status as DocumentStatus,
          chunkCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tenantId,
        }
        
        setDocuments((prev) => [newDoc, ...prev])
        return newDoc
      } else {
        throw new Error(data.error || 'Failed to upload document')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  /**
   * Delete a document
   */
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': tenantId,
        },
      })
      
      const data = await res.json()

      if (data.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        return true
      } else {
        throw new Error(data.error || 'Failed to delete document')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  /**
   * Get document by ID
   */
  const getDocumentById = useCallback((id: string): Document | undefined => {
    return documents.find((doc) => doc.id === id)
  }, [documents])

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentById,
  }
}

