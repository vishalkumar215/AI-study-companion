'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { uploadDocument, type UploadState } from '@/lib/documents'

const MAX_FILE_SIZE = 10 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

export function UploadForm() {
  const [state, action, pending] = useActionState<UploadState, FormData>(
    uploadDocument,
    undefined,
  )

  const [sizeError, setSizeError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && file.size > MAX_FILE_SIZE) {
      setSizeError(
        `"${file.name}" is ${formatBytes(file.size)} — the maximum file size is 10 MB.`,
      )
      e.target.value = ''
    } else {
      setSizeError(null)
    }
  }

  return (
    <form
      action={action}
      className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-6 dark:border-zinc-700 dark:bg-zinc-900/60"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Upload study material</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        PDF, Markdown, or plain text. We&apos;ll index it so you can ask
        questions.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
          >
            Title (optional)
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Defaults to the file name"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
          >
            File
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".pdf,.md,.markdown,.txt,text/plain,application/pdf,text/markdown"
            required
            onChange={handleFileChange}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          />
        </div>

        {sizeError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
          >
            <span className="mt-0.5 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <span>{sizeError}</span>
          </div>
        )}

        {state?.error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !!sizeError}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? 'Processing file…' : 'Upload & index'}
        </button>
      </div>
    </form>
  )
}
