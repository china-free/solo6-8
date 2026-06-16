import { Router, type Request, type Response } from 'express'
import prisma from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { STATUS_LABEL, CANDIDATE_STATUS_ORDER } from '../lib/statusRules.js'

const router = Router()

router.use(authMiddleware)

function buildCandidateWhere(query: any): any {
  const { jobId, startDate, endDate } = query
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
  return where
}

function buildDateWhere(query: any, dateField = 'createdAt'): any {
  const { startDate, endDate } = query
  const where: any = {}
  if (startDate || endDate) {
    where[dateField] = {}
    if (startDate) {
      where[dateField].gte = new Date(startDate as string)
    }
    if (endDate) {
      where[dateField].lte = new Date(endDate as string)
    }
  }
  return where
}

const FUNNEL_STATUSES = [
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

const CONVERSION_STAGES = [
  { from: 'NEW', to: 'SCREENING_PASSED', key: 'screeningPassRate', label: '筛选通过率' },
  { from: 'SCREENING_PASSED', to: 'FIRST_INTERVIEW', key: 'firstInterviewRate', label: '初面通过率' },
  { from: 'FIRST_INTERVIEW', to: 'SECOND_INTERVIEW', key: 'secondInterviewRate', label: '复面通过率' },
  { from: 'SECOND_INTERVIEW', to: 'FINAL_INTERVIEW', key: 'finalInterviewRate', label: '终面通过率' },
  { from: 'FINAL_INTERVIEW', to: 'OFFER_ACCEPTED', key: 'offerAcceptRate', label: 'Offer接受率' },
  { from: 'NEW', to: 'HIRED', key: 'overallHireRate', label: '整体入职率' },
]

router.get('/funnel', async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateWhere = buildCandidateWhere(req.query)

    const allCandidates = await prisma.candidate.findMany({
      where: candidateWhere,
      select: { status: true, id: true },
    })

    const statusCount: Record<string, number> = {}
    for (const status of FUNNEL_STATUSES) {
      statusCount[status] = 0
    }
    for (const c of allCandidates) {
      if (statusCount[c.status] !== undefined) {
        statusCount[c.status]++
      }
    }

    const funnelData = FUNNEL_STATUSES.map((status, idx) => {
      const cumulativeCount = FUNNEL_STATUSES.slice(idx).reduce((sum, s) => sum + statusCount[s], 0)
      return {
        status,
        label: STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status,
        count: cumulativeCount,
        statusCount: statusCount[status],
      }
    })

    const conversions = CONVERSION_STAGES.map((stage) => {
      const fromIdx = FUNNEL_STATUSES.indexOf(stage.from)
      const toIdx = FUNNEL_STATUSES.indexOf(stage.to)
      const fromCount = fromIdx >= 0 ? FUNNEL_STATUSES.slice(fromIdx).reduce((sum, s) => sum + statusCount[s], 0) : 0
      const toCount = toIdx >= 0 ? FUNNEL_STATUSES.slice(toIdx).reduce((sum, s) => sum + statusCount[s], 0) : 0
      const rate = fromCount > 0 ? Math.round((toCount / fromCount) * 10000) / 100 : 0
      return {
        key: stage.key,
        label: stage.label,
        from: stage.from,
        fromLabel: STATUS_LABEL[stage.from as keyof typeof STATUS_LABEL] || stage.from,
        to: stage.to,
        toLabel: STATUS_LABEL[stage.to as keyof typeof STATUS_LABEL] || stage.to,
        fromCount,
        toCount,
        rate,
      }
    })

    const statusLogWhere: any = {}
    if (req.query.jobId) {
      statusLogWhere.candidate = { appliedJobId: req.query.jobId as string }
    }
    if (req.query.startDate || req.query.endDate) {
      statusLogWhere.createdAt = {}
      if (req.query.startDate) {
        statusLogWhere.createdAt.gte = new Date(req.query.startDate as string)
      }
      if (req.query.endDate) {
        statusLogWhere.createdAt.lte = new Date(req.query.endDate as string)
      }
    }

    const statusLogs = await prisma.statusLog.findMany({
      where: statusLogWhere,
      select: {
        candidateId: true,
        fromStatus: true,
        toStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const candidateStatusDurations: Record<string, Record<string, number>> = {}
    const candidateFirstLog: Record<string, { status: string; time: Date }> = {}

    for (const log of statusLogs) {
      if (!candidateStatusDurations[log.candidateId]) {
        candidateStatusDurations[log.candidateId] = {}
      }
      if (log.fromStatus && candidateFirstLog[log.candidateId]) {
        const prev = candidateFirstLog[log.candidateId]
        if (prev.status === log.fromStatus) {
          const duration = log.createdAt.getTime() - prev.time.getTime()
          if (!candidateStatusDurations[log.candidateId][log.fromStatus]) {
            candidateStatusDurations[log.candidateId][log.fromStatus] = 0
          }
          candidateStatusDurations[log.candidateId][log.fromStatus] += duration
        }
      }
      candidateFirstLog[log.candidateId] = {
        status: log.toStatus,
        time: log.createdAt,
      }
    }

    const stageTotalDuration: Record<string, number> = {}
    const stageCandidateCount: Record<string, number> = {}

    for (const candidateId of Object.keys(candidateStatusDurations)) {
      for (const status of Object.keys(candidateStatusDurations[candidateId])) {
        if (!stageTotalDuration[status]) stageTotalDuration[status] = 0
        if (!stageCandidateCount[status]) stageCandidateCount[status] = 0
        stageTotalDuration[status] += candidateStatusDurations[candidateId][status]
        stageCandidateCount[status]++
      }
    }

    const avgDaysInStage = FUNNEL_STATUSES.map((status) => {
      const totalMs = stageTotalDuration[status] || 0
      const count = stageCandidateCount[status] || 0
      const avgDays = count > 0 ? Math.round((totalMs / (1000 * 60 * 60 * 24) / count) * 100) / 100 : 0
      return {
        status,
        label: STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status,
        avgDays,
        candidateCount: count,
      }
    })

    const totalDays = avgDaysInStage.reduce((sum, s) => sum + s.avgDays, 0)
    const stageDuration = {
      totalAvgDays: Math.round(totalDays * 100) / 100,
      stages: avgDaysInStage.filter((s) => s.candidateCount > 0),
    }

    const totalCount = allCandidates.length
    const hiredCount = statusCount['HIRED'] || 0

    res.json({
      data: {
        funnel: funnelData,
        total: totalCount,
        hired: hiredCount,
        conversionRate: totalCount > 0 ? Math.round((hiredCount / totalCount) * 10000) / 100 : 0,
        conversions,
        avgDaysInStage,
        stageDuration,
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
    const candidateWhere = buildCandidateWhere(req.query)

    const candidates = await prisma.candidate.findMany({
      where: candidateWhere,
      select: {
        id: true,
        source: true,
        status: true,
        interviews: {
          select: {
            id: true,
            status: true,
            round: true,
          },
        },
        evaluations: {
          select: {
            overallRating: true,
          },
        },
      },
    })

    const sourceStats: Record<string, {
      total: number
      interviewCount: number
      hiredCount: number
      totalRating: number
      ratingCount: number
      totalRounds: number
      roundCandidateCount: number
      statusDistribution: Record<string, number>
    }> = {}

    for (const c of candidates) {
      const source = c.source || '未知来源'
      if (!sourceStats[source]) {
        sourceStats[source] = {
          total: 0,
          interviewCount: 0,
          hiredCount: 0,
          totalRating: 0,
          ratingCount: 0,
          totalRounds: 0,
          roundCandidateCount: 0,
          statusDistribution: {},
        }
      }
      sourceStats[source].total++

      if (!sourceStats[source].statusDistribution[c.status]) {
        sourceStats[source].statusDistribution[c.status] = 0
      }
      sourceStats[source].statusDistribution[c.status]++

      const hasInterview = c.interviews.length > 0
      if (hasInterview) {
        sourceStats[source].interviewCount++
        const maxRound = Math.max(...c.interviews.map((i) => i.round), 0)
        sourceStats[source].totalRounds += maxRound
        sourceStats[source].roundCandidateCount++
      }

      if (c.status === 'HIRED') {
        sourceStats[source].hiredCount++
      }

      if (c.evaluations.length > 0) {
        const avgRating = c.evaluations.reduce((sum, e) => sum + e.overallRating, 0) / c.evaluations.length
        sourceStats[source].totalRating += avgRating
        sourceStats[source].ratingCount++
      }
    }

    const totalCandidates = candidates.length
    const data = Object.entries(sourceStats).map(([source, stats]) => {
      const interviewRate = stats.total > 0 ? Math.round((stats.interviewCount / stats.total) * 10000) / 100 : 0
      const hireRate = stats.total > 0 ? Math.round((stats.hiredCount / stats.total) * 10000) / 100 : 0
      const avgRating = stats.ratingCount > 0 ? Math.round((stats.totalRating / stats.ratingCount) * 100) / 100 : 0
      const avgRounds = stats.roundCandidateCount > 0 ? Math.round((stats.totalRounds / stats.roundCandidateCount) * 100) / 100 : 0

      const qualityScore = Math.round((interviewRate * 0.3 + hireRate * 0.5 + avgRating * 5) * 100) / 100

      const statusDistribution = Object.entries(stats.statusDistribution).map(([status, count]) => ({
        status,
        label: STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status,
        count,
      }))

      return {
        source,
        count: stats.total,
        percentage: totalCandidates > 0 ? Math.round((stats.total / totalCandidates) * 10000) / 100 : 0,
        interviewCount: stats.interviewCount,
        interviewRate,
        hiredCount: stats.hiredCount,
        hireRate,
        averageRating: avgRating,
        averageInterviewRounds: avgRounds,
        qualityScore,
        statusDistribution,
      }
    })

    const sortedData = data.sort((a, b) => b.qualityScore - a.qualityScore).map((item, index) => ({
      ...item,
      rank: index + 1,
    }))

    res.json({
      data: sortedData,
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

    const interviewDateWhere: any = {}
    if (startDate || endDate) {
      interviewDateWhere.scheduledAt = {}
      if (startDate) {
        interviewDateWhere.scheduledAt.gte = new Date(startDate as string)
      }
      if (endDate) {
        interviewDateWhere.scheduledAt.lte = new Date(endDate as string)
      }
    }

    const evaluationWhere: any = {}
    if (startDate || endDate) {
      evaluationWhere.createdAt = {}
      if (startDate) {
        evaluationWhere.createdAt.gte = new Date(startDate as string)
      }
      if (endDate) {
        evaluationWhere.createdAt.lte = new Date(endDate as string)
      }
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
            ...interviewDateWhere,
          },
          select: {
            id: true,
            status: true,
            round: true,
            scheduledAt: true,
          },
        },
        evaluations: {
          where: evaluationWhere,
          select: {
            id: true,
            overallRating: true,
            recommendation: true,
            createdAt: true,
            interviewId: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    const interviewIds = new Set<string>()
    for (const interviewer of interviewers) {
      for (const interview of interviewer.interviews) {
        interviewIds.add(interview.id)
      }
    }

    const interviewMap = new Map<string, { scheduledAt: Date; status: string; round: number }>()
    if (interviewIds.size > 0) {
      const interviews = await prisma.interview.findMany({
        where: { id: { in: Array.from(interviewIds) } },
        select: { id: true, scheduledAt: true, status: true, round: true },
      })
      for (const interview of interviews) {
        interviewMap.set(interview.id, {
          scheduledAt: interview.scheduledAt,
          status: interview.status,
          round: interview.round,
        })
      }
    }

    const data = interviewers.map((interviewer) => {
      const totalInterviews = interviewer.interviews.length
      const completedInterviews = interviewer.interviews.filter((i) => i.status === 'COMPLETED').length
      const pendingInterviews = totalInterviews - completedInterviews
      const evaluations = interviewer.evaluations

      const avgRating =
        evaluations.length > 0
          ? Math.round((evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length) * 100) / 100
          : 0

      const hireCount = evaluations.filter((e) => e.recommendation === 'HIRE').length
      const considerCount = evaluations.filter((e) => e.recommendation === 'CONSIDER').length
      const rejectCount = evaluations.filter((e) => e.recommendation === 'REJECT').length
      const passCount = hireCount + considerCount

      const passRate = evaluations.length > 0 ? Math.round((passCount / evaluations.length) * 10000) / 100 : 0
      const hireRate = evaluations.length > 0 ? Math.round((hireCount / evaluations.length) * 10000) / 100 : 0

      let timelyCount = 0
      for (const evaluation of evaluations) {
        const interview = interviewMap.get(evaluation.interviewId)
        if (interview && interview.status === 'COMPLETED') {
          const timeDiff = evaluation.createdAt.getTime() - interview.scheduledAt.getTime()
          const hoursDiff = timeDiff / (1000 * 60 * 60)
          if (hoursDiff <= 24 && hoursDiff >= 0) {
            timelyCount++
          }
        }
      }
      const timelyRate = evaluations.length > 0 ? Math.round((timelyCount / evaluations.length) * 10000) / 100 : 0

      const roundDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
      for (const interview of interviewer.interviews) {
        const round = interview.round || 1
        if (round <= 3) {
          roundDistribution[round]++
        }
      }

      const roundLabels: Record<number, string> = { 1: '初面', 2: '复试', 3: '终面' }
      const roundStats = Object.entries(roundDistribution).map(([round, count]) => ({
        round: parseInt(round),
        label: roundLabels[parseInt(round)] || `第${round}轮`,
        count,
        percentage: totalInterviews > 0 ? Math.round((count / totalInterviews) * 10000) / 100 : 0,
      }))

      const efficiencyScore = Math.round(
        (completedInterviews * 2 + avgRating * 10 + timelyRate * 0.5 + hireRate * 0.3) * 100
      ) / 100

      return {
        id: interviewer.id,
        name: interviewer.name,
        email: interviewer.email,
        role: interviewer.role,
        department: interviewer.department,
        totalInterviews,
        completedInterviews,
        pendingInterviews,
        evaluationCount: evaluations.length,
        averageRating: avgRating,
        hireCount,
        considerCount,
        rejectCount,
        passRate,
        hireRate,
        timelyRate,
        roundDistribution: roundStats,
        efficiencyScore,
      }
    })

    const sortedData = data.sort((a, b) => b.efficiencyScore - a.efficiencyScore).map((item, index) => ({
      ...item,
      workRank: index + 1,
    }))

    res.json({
      data: sortedData,
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

router.get('/trend', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'week', jobId } = req.query
    const isWeekly = period === 'week'
    const periods = isWeekly ? 12 : 6

    const candidateWhere: any = {}
    if (jobId) {
      candidateWhere.appliedJobId = jobId as string
    }

    const now = new Date()
    const periodDates: { start: Date; end: Date; label: string }[] = []

    for (let i = periods - 1; i >= 0; i--) {
      const start = new Date(now)
      if (isWeekly) {
        start.setDate(start.getDate() - i * 7)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        periodDates.push({
          start,
          end,
          label: `${start.getMonth() + 1}/${start.getDate()}`,
        })
      } else {
        start.setMonth(start.getMonth() - i)
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        periodDates.push({
          start,
          end,
          label: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        })
      }
    }

    const newCandidatesTrend = await Promise.all(
      periodDates.map(async (pd) => {
        const count = await prisma.candidate.count({
          where: {
            ...candidateWhere,
            createdAt: { gte: pd.start, lte: pd.end },
          },
        })
        return { period: pd.label, value: count }
      })
    )

    const interviewsTrend = await Promise.all(
      periodDates.map(async (pd) => {
        const where: any = {
          scheduledAt: { gte: pd.start, lte: pd.end },
        }
        if (jobId) {
          where.jobId = jobId as string
        }
        const count = await prisma.interview.count({ where })
        return { period: pd.label, value: count }
      })
    )

    const hiredTrend = await Promise.all(
      periodDates.map(async (pd) => {
        const statusLogs = await prisma.statusLog.findMany({
          where: {
            toStatus: 'HIRED',
            createdAt: { gte: pd.start, lte: pd.end },
            ...(jobId ? { candidate: { appliedJobId: jobId as string } } : {}),
          },
          select: { id: true },
        })
        return { period: pd.label, value: statusLogs.length }
      })
    )

    function calcMoM(trend: { period: string; value: number }[]) {
      return trend.map((item, index) => {
        if (index === 0) {
          return { ...item, mom: null }
        }
        const prev = trend[index - 1].value
        const mom = prev > 0 ? Math.round(((item.value - prev) / prev) * 10000) / 100 : null
        return { ...item, mom }
      })
    }

    const stageStatuses = ['NEW', 'SCREENING_PASSED', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'FINAL_INTERVIEW', 'HIRED']
    const stageTrend = await Promise.all(
      stageStatuses.map(async (status) => {
        const counts = await Promise.all(
          periodDates.map(async (pd) => {
            const count = await prisma.candidate.count({
              where: {
                ...candidateWhere,
                status: status as any,
                createdAt: { lte: pd.end },
              },
            })
            return { period: pd.label, value: count }
          })
        )
        return {
          status,
          label: STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status,
          data: counts,
        }
      })
    )

    res.json({
      data: {
        period: isWeekly ? 'week' : 'month',
        periods,
        newCandidates: calcMoM(newCandidatesTrend),
        interviews: calcMoM(interviewsTrend),
        hired: calcMoM(hiredTrend),
        stageTrend,
      },
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get trend analytics error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.get('/efficiency', async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateWhere = buildCandidateWhere(req.query)

    const hiredCandidates = await prisma.candidate.findMany({
      where: {
        ...candidateWhere,
        status: 'HIRED',
      },
      select: {
        id: true,
        createdAt: true,
        statusLogs: {
          where: { toStatus: 'HIRED' },
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    let totalHireDays = 0
    let hireCountWithTime = 0
    for (const c of hiredCandidates) {
      if (c.statusLogs.length > 0) {
        const hireTime = c.statusLogs[0].createdAt
        const days = (hireTime.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        if (days >= 0) {
          totalHireDays += days
          hireCountWithTime++
        }
      }
    }
    const avgHireCycle = hireCountWithTime > 0 ? Math.round((totalHireDays / hireCountWithTime) * 100) / 100 : 0

    const statusLogWhere: any = {}
    if (req.query.jobId) {
      statusLogWhere.candidate = { appliedJobId: req.query.jobId as string }
    }
    if (req.query.startDate || req.query.endDate) {
      statusLogWhere.createdAt = {}
      if (req.query.startDate) {
        statusLogWhere.createdAt.gte = new Date(req.query.startDate as string)
      }
      if (req.query.endDate) {
        statusLogWhere.createdAt.lte = new Date(req.query.endDate as string)
      }
    }

    const statusLogs = await prisma.statusLog.findMany({
      where: statusLogWhere,
      select: {
        candidateId: true,
        fromStatus: true,
        toStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const candidateStageDurations: Record<string, Record<string, number>> = {}
    const candidateLastStatus: Record<string, { status: string; time: Date }> = {}

    for (const log of statusLogs) {
      if (!candidateStageDurations[log.candidateId]) {
        candidateStageDurations[log.candidateId] = {}
      }
      if (log.fromStatus && candidateLastStatus[log.candidateId]) {
        const prev = candidateLastStatus[log.candidateId]
        if (prev.status === log.fromStatus) {
          const duration = log.createdAt.getTime() - prev.time.getTime()
          if (!candidateStageDurations[log.candidateId][log.fromStatus]) {
            candidateStageDurations[log.candidateId][log.fromStatus] = 0
          }
          candidateStageDurations[log.candidateId][log.fromStatus] += duration
        }
      }
      candidateLastStatus[log.candidateId] = {
        status: log.toStatus,
        time: log.createdAt,
      }
    }

    const stageAvgDaysMap: Record<string, { total: number; count: number }> = {}
    for (const cid of Object.keys(candidateStageDurations)) {
      for (const stage of Object.keys(candidateStageDurations[cid])) {
        if (!stageAvgDaysMap[stage]) {
          stageAvgDaysMap[stage] = { total: 0, count: 0 }
        }
        stageAvgDaysMap[stage].total += candidateStageDurations[cid][stage]
        stageAvgDaysMap[stage].count++
      }
    }

    const stageEfficiency = FUNNEL_STATUSES.map((status) => {
      const data = stageAvgDaysMap[status]
      const avgDays = data && data.count > 0 ? Math.round((data.total / (1000 * 60 * 60 * 24) / data.count) * 100) / 100 : 0
      return {
        status,
        label: STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status,
        avgDays,
        candidateCount: data?.count || 0,
      }
    }).filter((s) => s.candidateCount > 0)

    const completedInterviews = await prisma.interview.findMany({
      where: {
        status: 'COMPLETED',
        ...(req.query.jobId ? { jobId: req.query.jobId as string } : {}),
        ...(req.query.startDate || req.query.endDate
          ? {
              scheduledAt: {
                ...(req.query.startDate ? { gte: new Date(req.query.startDate as string) } : {}),
                ...(req.query.endDate ? { lte: new Date(req.query.endDate as string) } : {}),
              },
            }
          : {}),
      },
      select: {
        id: true,
        scheduledAt: true,
        evaluations: {
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    })

    let totalResponseHours = 0
    let responseCount = 0
    for (const interview of completedInterviews) {
      if (interview.evaluations.length > 0) {
        const evalTime = interview.evaluations[0].createdAt
        const hours = (evalTime.getTime() - interview.scheduledAt.getTime()) / (1000 * 60 * 60)
        if (hours >= 0) {
          totalResponseHours += hours
          responseCount++
        }
      }
    }
    const avgInterviewerResponseTime = responseCount > 0 ? Math.round((totalResponseHours / responseCount) * 100) / 100 : 0

    const jobFilter: any = {}
    if (req.query.jobId) {
      jobFilter.id = req.query.jobId as string
    }
    const jobsWithHires = await prisma.job.findMany({
      where: jobFilter,
      select: {
        id: true,
        title: true,
        createdAt: true,
        candidates: {
          where: { status: 'HIRED' },
          select: { id: true, createdAt: true, statusLogs: { where: { toStatus: 'HIRED' }, select: { createdAt: true }, take: 1, orderBy: { createdAt: 'desc' } } },
        },
        _count: {
          select: { candidates: true },
        },
      },
    })

    let totalFillDays = 0
    let fillCount = 0
    const jobFillTimes: { jobId: string; title: string; avgFillDays: number; hireCount: number }[] = []

    for (const job of jobsWithHires) {
      let jobTotalDays = 0
      let jobHireCount = 0
      for (const candidate of job.candidates) {
        if (candidate.statusLogs.length > 0) {
          const hireTime = candidate.statusLogs[0].createdAt
          const days = (hireTime.getTime() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          if (days >= 0) {
            jobTotalDays += days
            jobHireCount++
          }
        }
      }
      if (jobHireCount > 0) {
        const avgFillDays = Math.round((jobTotalDays / jobHireCount) * 100) / 100
        jobFillTimes.push({
          jobId: job.id,
          title: job.title,
          avgFillDays,
          hireCount: jobHireCount,
        })
        totalFillDays += jobTotalDays
        fillCount += jobHireCount
      }
    }

    const avgJobFillTime = fillCount > 0 ? Math.round((totalFillDays / fillCount) * 100) / 100 : 0

    const screeningWhere: any = {
      ...candidateWhere,
      statusLogs: {
        some: {
          OR: [{ toStatus: 'SCREENING_PASSED' }, { toStatus: 'REJECTED' }],
        },
      },
    }

    const screenedCandidates = await prisma.candidate.findMany({
      where: screeningWhere,
      select: {
        id: true,
        createdAt: true,
        statusLogs: {
          where: {
            OR: [{ toStatus: 'SCREENING_PASSED' }, { toStatus: 'REJECTED' }],
          },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    })

    let totalScreeningDays = 0
    let screeningCount = 0
    for (const c of screenedCandidates) {
      if (c.statusLogs.length > 0) {
        const screenTime = c.statusLogs[0].createdAt
        const days = (screenTime.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        if (days >= 0) {
          totalScreeningDays += days
          screeningCount++
        }
      }
    }
    const avgScreeningDays = screeningCount > 0 ? Math.round((totalScreeningDays / screeningCount) * 100) / 100 : 0

    const totalCandidates = await prisma.candidate.count({ where: candidateWhere })
    const screeningEfficiency = totalCandidates > 0 ? Math.round((screeningCount / totalCandidates) * 10000) / 100 : 0

    res.json({
      data: {
        avgHireCycle,
        stageEfficiency,
        avgInterviewerResponseTime,
        avgJobFillTime,
        avgScreeningDays,
        screeningEfficiency,
        jobFillTimes: jobFillTimes.sort((a, b) => a.avgFillDays - b.avgFillDays),
        summary: {
          totalHired: hiredCandidates.length,
          totalScreened: screeningCount,
          totalJobs: jobsWithHires.length,
          jobsWithHires: jobFillTimes.length,
        },
      },
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get efficiency analytics error:', error)
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
