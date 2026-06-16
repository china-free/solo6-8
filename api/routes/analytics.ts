import { Router, type Request, type Response } from 'express'
import prisma from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/funnel', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, startDate, endDate } = req.query

    const candidateWhere: any = {}
    if (jobId) {
      candidateWhere.appliedJobId = jobId as string
    }
    if (startDate) {
      candidateWhere.createdAt = { gte: new Date(startDate as string) }
    }
    if (endDate) {
      if (!candidateWhere.createdAt) candidateWhere.createdAt = {}
      candidateWhere.createdAt.lte = new Date(endDate as string)
    }

    const statusOrder = [
      'NEW',
      'SCREENING',
      'SCREENING_PASSED',
      'FIRST_INTERVIEW',
      'SECOND_INTERVIEW',
      'FINAL_INTERVIEW',
      'OFFER_PENDING',
      'OFFER_SENT',
      'OFFER_ACCEPTED',
      'HIRED',
    ]

    const statusLabels: Record<string, string> = {
      NEW: '新简历',
      SCREENING: '待筛选',
      SCREENING_PASSED: '筛选通过',
      FIRST_INTERVIEW: '待初面',
      SECOND_INTERVIEW: '待复试',
      FINAL_INTERVIEW: '待终面',
      OFFER_PENDING: '待发Offer',
      OFFER_SENT: 'Offer已发送',
      OFFER_ACCEPTED: 'Offer已接受',
      HIRED: '已入职',
      REJECTED: '人才库',
      OFFER_REJECTED: 'Offer已拒绝',
    }

    const allCandidates = await prisma.candidate.findMany({
      where: candidateWhere,
      select: { status: true },
    })

    const funnelData = statusOrder.map((status) => {
      const currentIndex = statusOrder.indexOf(status)
      const count = allCandidates.filter((c) => {
        const candidateIndex = statusOrder.indexOf(c.status)
        return candidateIndex >= currentIndex
      }).length

      return {
        status,
        label: statusLabels[status] || status,
        count,
      }
    })

    const totalCount = allCandidates.length
    const hiredCount = allCandidates.filter((c) => c.status === 'HIRED').length

    res.json({
      data: {
        funnel: funnelData,
        total: totalCount,
        hired: hiredCount,
        conversionRate: totalCount > 0 ? Math.round((hiredCount / totalCount) * 10000) / 100 : 0,
      },
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get funnel analytics error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.get('/sources', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, startDate, endDate } = req.query

    const where: any = {}
    if (jobId) {
      where.appliedJobId = jobId as string
    }
    if (startDate) {
      where.createdAt = { gte: new Date(startDate as string) }
    }
    if (endDate) {
      if (!where.createdAt) where.createdAt = {}
      where.createdAt.lte = new Date(endDate as string)
    }

    const candidates = await prisma.candidate.findMany({
      where,
      select: { source: true },
    })

    const sourceCount: Record<string, number> = {}
    for (const c of candidates) {
      const source = c.source || '未知来源'
      sourceCount[source] = (sourceCount[source] || 0) + 1
    }

    const total = candidates.length
    const data = Object.entries(sourceCount)
      .map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    res.json({
      data,
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get source analytics error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.get('/interviewers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query

    const evaluationWhere: any = {}
    if (startDate) {
      evaluationWhere.createdAt = { gte: new Date(startDate as string) }
    }
    if (endDate) {
      if (!evaluationWhere.createdAt) evaluationWhere.createdAt = {}
      evaluationWhere.createdAt.lte = new Date(endDate as string)
    }

    const interviewers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'INTERVIEWER' },
          { role: 'HIRING_MANAGER' },
          { role: 'ADMIN' },
        ],
      },
      include: {
        interviews: {
          where: {
            status: { in: ['SCHEDULED', 'COMPLETED'] },
            ...(startDate || endDate
              ? {
                  scheduledAt: {
                    ...(startDate ? { gte: new Date(startDate as string) } : {}),
                    ...(endDate ? { lte: new Date(endDate as string) } : {}),
                  },
                }
              : {}),
          },
          select: { id: true, status: true },
        },
        evaluations: {
          where: evaluationWhere,
          select: {
            id: true,
            overallRating: true,
            recommendation: true,
          },
        },
      },
    })

    const data = interviewers.map((interviewer) => {
      const totalInterviews = interviewer.interviews.length
      const completedInterviews = interviewer.interviews.filter((i) => i.status === 'COMPLETED').length
      const evaluations = interviewer.evaluations
      const avgRating =
        evaluations.length > 0
          ? Math.round((evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length) * 100) / 100
          : 0
      const hireCount = evaluations.filter((e) => e.recommendation === 'HIRE').length

      return {
        id: interviewer.id,
        name: interviewer.name,
        email: interviewer.email,
        role: interviewer.role,
        department: interviewer.department,
        totalInterviews,
        completedInterviews,
        pendingInterviews: totalInterviews - completedInterviews,
        evaluationCount: evaluations.length,
        averageRating: avgRating,
        hireCount,
      }
    })

    res.json({
      data: data.sort((a, b) => b.completedInterviews - a.completedInterviews),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get interviewer analytics error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.get('/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalCandidates, totalJobs, activeJobs, totalInterviews, todayInterviews, hiredCandidates] =
      await Promise.all([
        prisma.candidate.count(),
        prisma.job.count(),
        prisma.job.count({ where: { status: 'PUBLISHED' } }),
        prisma.interview.count(),
        prisma.interview.count({
          where: {
            scheduledAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
        prisma.candidate.count({ where: { status: 'HIRED' } }),
      ])

    const recentCandidates = await prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { appliedJob: true },
    })

    res.json({
      data: {
        totalCandidates,
        totalJobs,
        activeJobs,
        totalInterviews,
        todayInterviews,
        hiredCandidates,
        recentCandidates: recentCandidates.map((c) => ({
          id: c.id,
          name: c.name,
          position: c.position,
          status: c.status,
          appliedJobTitle: c.appliedJob?.title,
          createdAt: c.createdAt.toISOString(),
        })),
      },
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get overview analytics error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

export default router
