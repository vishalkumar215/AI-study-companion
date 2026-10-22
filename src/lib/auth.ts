'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { sendOtpEmail, isSmtpConfigured } from '@/lib/email'
import { verifySession } from '@/lib/dal'
import { rateLimit } from '@/lib/rate-limit-db'

const AuthSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Enter a valid email').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const ResetRequestSchema = z.object({
  email: z.string().email('Enter a valid email').trim().toLowerCase(),
})

const ResetSchema = z.object({
  email: z.string().email('Enter a valid email').trim().toLowerCase(),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
})

const ChangeNameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
})

const OTP_TTL_MS = 15 * 60 * 1000

export type AuthState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        form?: string[]
      }
    }
  | undefined

export async function signup(state: AuthState, formData: FormData) {
  const validated = AuthSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, password } = validated.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { errors: { email: ['An account with this email already exists'] } }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await db.user.create({ data: { name, email, passwordHash } })

  await createSession(user.id, user.sessionVersion)
  redirect('/dashboard')
}

export async function login(state: AuthState, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!(await rateLimit(`login:${email}`, 5, 5 * 60 * 1000))) {
    return {
      errors: {
        form: ['Too many login attempts. Try again in a few minutes.'],
      },
    }
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return { errors: { form: ['Invalid email or password'] } }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { errors: { form: ['Invalid email or password'] } }
  }

  await createSession(user.id, user.sessionVersion)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}

export type ResetRequestState =
  | {
      errors?: { email?: string[]; form?: string[] }
      success?: boolean
      previewOtp?: string
    }
  | undefined

export async function requestPasswordReset(
  state: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const validated = ResetRequestSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email } = validated.data

  if (!(await rateLimit(`reset:request:${email}`, 3, 15 * 60 * 1000))) {
    return {
      errors: {
        form: ['Too many reset requests. Try again in a few minutes.'],
      },
    }
  }

  const user = await db.user.findUnique({ where: { email } })

  // Always succeed with the same message to avoid leaking which emails exist.
  if (!user) {
    return { success: true }
  }

  await db.passwordReset.deleteMany({ where: { userId: user.id } })

  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const otpHash = await bcrypt.hash(otp, 10)

  await db.passwordReset.create({
    data: {
      userId: user.id,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  })

  const mail = await sendOtpEmail(email, otp)

  if (!mail.ok && isSmtpConfigured()) {
    console.error(
      `[auth] Failed to send reset code to ${email}:`,
      mail.error ?? 'unknown error',
    )
    return {
      errors: {
        form: ['Could not send the reset email right now. Please try again later.'],
      },
    }
  }

  // Without SMTP (local development), surface the code on-screen so the
  // reset flow still works instead of dead-ending.
  if (!mail.ok) {
    return { success: true, previewOtp: otp }
  }

  return { success: true }
}

export type ResetState =
  | {
      errors?: {
        email?: string[]
        code?: string[]
        password?: string[]
        confirmPassword?: string[]
        form?: string[]
      }
    }
  | undefined

export async function resetPassword(
  state: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const validated = ResetSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, code, password, confirmPassword } = validated.data

  if (password !== confirmPassword) {
    return { errors: { confirmPassword: ['Passwords do not match'] } }
  }

  if (!(await rateLimit(`reset:attempt:${email}`, 5, 15 * 60 * 1000))) {
    return {
      errors: { form: ['Too many reset attempts. Try again in a few minutes.'] },
    }
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return { errors: { form: ['Invalid email or code'] } }
  }

  const reset = await db.passwordReset.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!reset) {
    return { errors: { form: ['Invalid or expired code. Request a new one.'] } }
  }

  const valid = await bcrypt.compare(code, reset.otpHash)
  if (!valid) {
    return { errors: { form: ['Invalid or expired code. Request a new one.'] } }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash, sessionVersion: { increment: 1 } },
  })

  await db.passwordReset.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  })

  redirect('/login?reset=1')
}

export type ChangeNameState =
  | {
      errors?: { name?: string[]; form?: string[] }
      success?: boolean
    }
  | undefined

export async function changeName(
  state: ChangeNameState,
  formData: FormData,
): Promise<ChangeNameState> {
  const validated = ChangeNameSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { userId } = await verifySession()

  await db.user.update({
    where: { id: userId },
    data: { name: validated.data.name },
  })

  return { success: true }
}

export type ChangePasswordState =
  | {
      errors?: {
        currentPassword?: string[]
        newPassword?: string[]
        confirmPassword?: string[]
        form?: string[]
      }
      success?: boolean
    }
  | undefined

export async function changePassword(
  state: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { currentPassword, newPassword, confirmPassword } = validated.data

  if (newPassword !== confirmPassword) {
    return { errors: { confirmPassword: ['Passwords do not match'] } }
  }

  const { userId } = await verifySession()

  if (!(await rateLimit(`password:change:${userId}`, 5, 5 * 60 * 1000))) {
    return {
      errors: { form: ['Too many attempts. Try again in a few minutes.'] },
    }
  }

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    return { errors: { form: ['Account not found'] } }
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    return { errors: { currentPassword: ['Current password is incorrect'] } }
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  const updated = await db.user.update({
    where: { id: userId },
    data: { passwordHash, sessionVersion: { increment: 1 } },
  })

  // Rotate the session: this user stays logged in, all older sessions are invalidated.
  await createSession(updated.id, updated.sessionVersion)

  return { success: true }
}
