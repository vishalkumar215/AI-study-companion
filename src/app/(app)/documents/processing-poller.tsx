'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ProcessingPoller({ hasProcessing }: { hasProcessing: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!hasProcessing) return

    const interval = setInterval(() => {
      router.refresh()
    }, 3000)

    return () => clearInterval(interval)
  }, [hasProcessing, router])

  if (!hasProcessing) return null

  return (
    <p className="rounded-xl border border-amber-300 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:text-amber-300">
      Some documents are still being indexed. This page refreshes
      automatically — no need to reload.
    </p>
  )
}
