import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types'

/**
 * Hook for managing chat functionality
 * Handles message state, sending queries, and conversation flow
 */
export interface UseChatOptions {
  initialMessages?: ChatMessage[]
  onMessage?: (message: ChatMessage) => void
  onError?: (error: Error) => void
}

export interface UseChatReturn {
  messages: ChatMessage[]
  input: string
  loading: boolean
  setInput: (input: string) => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  stopGenerating: () => void
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessages = [], onMessage, onError } = options
  
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: content }),
        signal: abortControllerRef.current.signal,
      })
      
      const data = await res.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.answer,
          sources: data.data.sources,
        }
        
        setMessages((prev) => [...prev, assistantMessage])
        onMessage?.(assistantMessage)
      } else {
        throw new Error(data.error?.message || 'Failed to send message')
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Request was cancelled, don't treat as error
        return
      }
      
      console.error('Failed to send message:', error)
      onError?.(error as Error)
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [loading, onMessage, onError])

  /**
   * Stop generating response
   */
  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }, [])

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    messages,
    input,
    loading,
    setInput,
    sendMessage,
    clearMessages,
    stopGenerating,
  }
}

/**
 * Hook for auto-scrolling to bottom of chat
 */
export function useChatScroll(messages: ChatMessage[]) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return { messagesEndRef, scrollToBottom }
}

