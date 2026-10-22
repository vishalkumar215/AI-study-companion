'use client'

import { useEffect } from 'react'

export function ErrorAutoReload({
  errors,
  delayMs = 5000,
}: {
  errors?: Record<string, unknown> | null
  delayMs?: number
}) {
  useEffect(() => {
    if (!errors) return

    const hasError = Object.values(errors).some(
      (value) => Array.isArray(value) && value.length > 0,
    )
    if (!hasError) return

    const timer = setTimeout(() => window.location.reload(), delayMs)
    return () => clearTimeout(timer)
  }, [errors, delayMs])

  return null
}
