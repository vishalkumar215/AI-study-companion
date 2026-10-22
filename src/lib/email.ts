import 'server-only'

import nodemailer from 'nodemailer'

const from = process.env.SMTP_FROM ?? 'StudyMate AI <noreply@studymate.test>'

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST)
}

let transport: nodemailer.Transporter | null = null

async function getTransport(): Promise<nodemailer.Transporter> {
  if (transport) return transport

  if (!isSmtpConfigured()) {
    throw new Error(
      'SMTP is not configured (SMTP_HOST is empty). Set the SMTP_* environment variables to enable password reset emails.',
    )
  }

  const timeouts = {
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 6000,
  }

  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    ...timeouts,
  })
  return transport
}

export type OtpMailResult = { ok: boolean; error?: string }

export async function sendOtpEmail(
  to: string,
  otp: string,
): Promise<OtpMailResult> {
  try {
    const t = await getTransport()
    await t.sendMail({
      from,
      to,
      subject: 'Your StudyMate password reset code',
      text: `Your password reset code is ${otp}.\n\nIt expires in 15 minutes. If you didn't request this, you can safely ignore this email.`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="margin-bottom:4px">Reset your password</h2>
      <p>Use this code to set a new password:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${otp}</p>
      <p style="color:#666">It expires in 15 minutes. If you didn't request this, ignore this email.</p>
    </div>`,
    })

    return { ok: true }
  } catch (err) {
    console.error(
      '[email] Failed to send OTP email:',
      err instanceof Error ? err.message : err,
    )
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown email error',
    }
  }
}
