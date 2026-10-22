import type { Metadata } from 'next'
import { GlobalChat } from './global-chat'

export const metadata: Metadata = {
  title: 'Chat with everything',
}

export default function GlobalStudyPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="pb-4">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Chat with everything
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ask a question and the AI searches across all of your documents,
          with source citations.
        </p>
      </div>

      <GlobalChat />
    </div>
  )
}
