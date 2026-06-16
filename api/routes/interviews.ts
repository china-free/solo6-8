import { Router, type Request, type Response } from 'express'
import prisma from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { serializeInterview, serializeEvaluation } from '../lib/serializers.js'
import { sendInterviewScheduledEmail } from '../lib/notification.js'

const router = Router()

router.use(authMiddleware)

async function checkInterviewerConflict(
  interviewerIds: string[],
  scheduledAt: Date,
  duration: number,
  excludeInterviewId?: string,
): Promise<string | null> {
  const endTime = new Date(scheduledAt.getTime() + duration * 60 * 1000)

  for (const interviewerId of interviewerIds) {
    const conflicting = await prisma.interview.findFirst({
      where: {
        id: excludeInterviewId ? { not: excludeInterviewId } : undefined,
        interviewers: {
          some: { id: interviewerId },
        },
        status: 'SCHEDULED',
        AND: [
          {
            scheduledAt: {
              lt: endTime,
            },
          },
          {
            scheduledAt: {
              gte: new Date(scheduledAt.getTime() - 4 * 60 * 60 * 1000),
            },
          },
        ],
      },
      include: {
        interviewers: true,
      },
    })

    if (conflicting) {
      const conflictEnd = new Date(conflicting.scheduledAt.getTime() + conflicting.duration * 60 * 1000)
      if (scheduledAt < conflictEnd) {
        const interviewer = conflicting.interviewers.find((i) => i.id === interviewerId)
        return interviewer?.name || '面试官'
      }
    }
  }

  return null
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, candidateId, jobId, interviewerId, startDate, endDate } = req.query
    const where: any = {}

    if (status) {
      where.status = status as string
    }
    if (candidateId) {
      where.candidateId = candidateId as string
    }
    if (jobId) {
      where.jobId = jobId as string
    }
    if (interviewerId) {
      where.interviewers = {
        some: { id: interviewerId as string },
      }
    }
    if (startDate || endDate) {
      where.scheduledAt = {}
      if (startDate) {
        where.scheduledAt.gte = new Date(startDate as string)
      }
      if (endDate) {
        where.scheduledAt.lte = new Date(endDate as string)
      }
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        candidate: true,
        job: true,
        interviewers: true,
        evaluations: {
          include: {
            interviewer: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    res.json({
      data: interviews.map(serializeInterview),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get interviews error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
        interviewers: true,
        evaluations: {
          include: {
            interviewer: true,
          },
        },
      },
    })

    if (!interview) {
      res.status(404).json({
        data: null,
        message: '面试不存在',
        code: 404,
      })
      return
    }

    res.json({
      data: serializeInterview(interview),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get interview error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateId, jobId, round, type, scheduledAt, duration, meetingRoom, meetingLink, interviewerIds } = req.body

    if (!candidateId || !jobId || !scheduledAt || !interviewerIds || !Array.isArray(interviewerIds)) {
      res.status(400).json({
        data: null,
        message: '请填写必填字段',
        code: 400,
      })
      return
    }

    const scheduledDate = new Date(scheduledAt)
    const actualDuration = duration || 60

    const conflictInterviewer = await checkInterviewerConflict(interviewerIds, scheduledDate, actualDuration)
    if (conflictInterviewer) {
      res.status(400).json({
        data: null,
        message: `面试官 ${conflictInterviewer} 在该时间段已有面试安排`,
        code: 400,
      })
      return
    }

    const interview = await prisma.interview.create({
      data: {
        candidateId,
        jobId,
        round: round || 1,
        type: type || 'ONSITE',
        scheduledAt: scheduledDate,
        duration: actualDuration,
        meetingRoom,
        meetingLink,
        status: 'SCHEDULED',
        interviewers: {
          connect: interviewerIds.map((id: string) => ({ id })),
        },
      },
      include: {
        candidate: true,
        job: true,
        interviewers: true,
      },
    })

    if (interview.candidate && interview.job) {
      const typeLabels: Record<string, string> = {
        PHONE: '电话面试',
        ONSITE: '现场面试',
        VIDEO: '视频面试',
      }
      sendInterviewScheduledEmail(
        interview.candidate.email,
        interview.candidate.name,
        {
          jobTitle: interview.job.title,
          scheduledAt: scheduledDate.toLocaleString('zh-CN'),
          type: typeLabels[interview.type] || interview.type,
          meetingRoom: interview.meetingRoom || undefined,
          meetingLink: interview.meetingLink || undefined,
        },
      ).catch(console.error)
    }

    res.json({
      data: serializeInterview(interview),
      message: '面试安排成功',
      code: 200,
    })
  } catch (error) {
    console.error('Create interview error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { round, type, scheduledAt, duration, meetingRoom, meetingLink, status, interviewerIds } = req.body

    const data: any = {}
    if (round !== undefined) data.round = round
    if (type) data.type = type
    if (duration !== undefined) data.duration = duration
    if (meetingRoom !== undefined) data.meetingRoom = meetingRoom
    if (meetingLink !== undefined) data.meetingLink = meetingLink
    if (status) data.status = status

    let newScheduledAt: Date | null = null
    let newDuration: number | null = null

    if (scheduledAt) {
      newScheduledAt = new Date(scheduledAt)
      data.scheduledAt = newScheduledAt
    }
    if (duration !== undefined) {
      newDuration = duration
    }

    if (interviewerIds && Array.isArray(interviewerIds)) {
      const actualScheduledAt = newScheduledAt || (await prisma.interview.findUnique({ where: { id } }))?.scheduledAt
      const actualDuration = newDuration || (await prisma.interview.findUnique({ where: { id } }))?.duration || 60

      if (actualScheduledAt) {
        const conflictInterviewer = await checkInterviewerConflict(interviewerIds, actualScheduledAt, actualDuration, id)
        if (conflictInterviewer) {
          res.status(400).json({
            data: null,
            message: `面试官 ${conflictInterviewer} 在该时间段已有面试安排`,
            code: 400,
          })
          return
        }
      }

      data.interviewers = {
        set: interviewerIds.map((userId: string) => ({ id: userId })),
      }
    } else if (scheduledAt && !interviewerIds) {
      const existing = await prisma.interview.findUnique({
        where: { id },
        include: { interviewers: true },
      })
      if (existing) {
        const ids = existing.interviewers.map((i) => i.id)
        const actualDuration = newDuration || existing.duration
        const conflictInterviewer = await checkInterviewerConflict(ids, new Date(scheduledAt), actualDuration, id)
        if (conflictInterviewer) {
          res.status(400).json({
            data: null,
            message: `面试官 ${conflictInterviewer} 在该时间段已有面试安排`,
            code: 400,
          })
          return
        }
      }
    }

    const interview = await prisma.interview.update({
      where: { id },
      data,
      include: {
        candidate: true,
        job: true,
        interviewers: true,
        evaluations: {
          include: { interviewer: true },
        },
      },
    })

    res.json({
      data: serializeInterview(interview),
      message: '更新成功',
      code: 200,
    })
  } catch (error) {
    console.error('Update interview error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.interview.delete({ where: { id } })

    res.json({
      data: null,
      message: '删除成功',
      code: 200,
    })
  } catch (error) {
    console.error('Delete interview error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.post('/:id/evaluations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      interviewerId,
      candidateId,
      technicalRating,
      communicationRating,
      problemSolvingRating,
      teamworkRating,
      cultureFitRating,
      overallRating,
      comments,
      recommendation,
    } = req.body

    if (!interviewerId || !candidateId) {
      res.status(400).json({
        data: null,
        message: '请填写必填字段',
        code: 400,
      })
      return
    }

    const existing = await prisma.interviewEvaluation.findFirst({
      where: {
        interviewId: id,
        interviewerId,
      },
    })

    let evaluation
    if (existing) {
      evaluation = await prisma.interviewEvaluation.update({
        where: { id: existing.id },
        data: {
          technicalRating: technicalRating || 0,
          communicationRating: communicationRating || 0,
          problemSolvingRating: problemSolvingRating || 0,
          teamworkRating: teamworkRating || 0,
          cultureFitRating: cultureFitRating || 0,
          overallRating: overallRating || 0,
          comments,
          recommendation,
        },
        include: { interviewer: true },
      })
    } else {
      evaluation = await prisma.interviewEvaluation.create({
        data: {
          interviewId: id,
          interviewerId,
          candidateId,
          technicalRating: technicalRating || 0,
          communicationRating: communicationRating || 0,
          problemSolvingRating: problemSolvingRating || 0,
          teamworkRating: teamworkRating || 0,
          cultureFitRating: cultureFitRating || 0,
          overallRating: overallRating || 0,
          comments,
          recommendation,
        },
        include: { interviewer: true },
      })
    }

    res.json({
      data: serializeEvaluation(evaluation),
      message: '评价提交成功',
      code: 200,
    })
  } catch (error) {
    console.error('Create evaluation error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

export default router
