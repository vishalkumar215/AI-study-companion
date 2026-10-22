import type { Metadata } from 'next'
import { ResearchChat } from './research-chat'

export const metadata: Metadata = {
  title: 'Research',
}

export default function ResearchPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="pb-4">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Research
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ask anything — general knowledge from the AI model.
        </p>
      </div>

      <ResearchChat />
    </div>
  )
}
