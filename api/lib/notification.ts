import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com'
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER || 'noreply@example.com'
const SMTP_PASS = process.env.SMTP_PASS || 'password'
const SMTP_FROM = process.env.SMTP_FROM || '招聘系统 <noreply@example.com>'

const USE_MOCK = !process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

let transporter: nodemailer.Transporter | null = null

if (!USE_MOCK) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (USE_MOCK) {
    console.log('[Mock Email]', {
      from: SMTP_FROM,
      ...options,
    })
    return
  }

  if (!transporter) return

  await transporter.sendMail({
    from: SMTP_FROM,
    ...options,
  })
}

export async function sendInterviewScheduledEmail(
  candidateEmail: string,
  candidateName: string,
  interviewInfo: {
    jobTitle: string
    scheduledAt: string
    type: string
    meetingRoom?: string
    meetingLink?: string
  },
): Promise<void> {
  const subject = `面试邀请 - ${interviewInfo.jobTitle}`
  const text = `尊敬的 ${candidateName}，\n\n您已被安排参加 ${interviewInfo.jobTitle} 职位的面试。\n\n面试时间：${interviewInfo.scheduledAt}\n面试形式：${interviewInfo.type}\n${interviewInfo.meetingRoom ? `会议室：${interviewInfo.meetingRoom}\n` : ''}${interviewInfo.meetingLink ? `会议链接：${interviewInfo.meetingLink}\n` : ''}\n\n祝您面试顺利！\n\n招聘系统`

  await sendEmail({
    to: candidateEmail,
    subject,
    text,
  })
}
