'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'

function textOf(message: { parts: Array<{ type: string; text?: string }> }) {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('')
}

function errorMessage(error: Error): string {
  try {
    const body = JSON.parse(error.message) as { error?: string }
    if (body.error) return body.error
  } catch {
    // fall through to default message
  }
  return 'Something went wrong. Check your AI API key and try again.'
}

export function GlobalChat() {
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(
    null,
  )
  const loadedHistory = useRef(false)

  useEffect(() => {
    let cancelled = false
    loadedHistory.current = false
    fetch('/api/global-chat')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages?: UIMessage[] } | null) => {
        if (!cancelled && data?.messages) setInitialMessages(data.messages)
        else if (!cancelled) setInitialMessages([])
      })
      .catch(() => {
        if (!cancelled) setInitialMessages([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/global-chat' }),
  })

  const [input, setInput] = useState('')
  const isLoading = status === 'submitted' || status === 'streaming'
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!initialMessages || loadedHistory.current) return
    loadedHistory.current = true
    setMessages(initialMessages)
  }, [initialMessages, setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {initialMessages === null ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-500">Loading history…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-md text-center text-sm text-zinc-500">
              Ask a question and I&apos;ll search every document you&apos;ve
              uploaded, citing where each answer comes from.
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
            >
              {textOf(message)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Searching your documents…
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {errorMessage(error)}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask across all your documents…"
          className="flex-1 rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
