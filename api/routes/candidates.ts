import { Router, type Request, type Response } from 'express'
import prisma from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { serializeCandidate, serializeStatusLog } from '../lib/serializers.js'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, source, appliedJobId, search } = req.query
    const where: any = {}

    if (status) {
      where.status = status as string
    }
    if (source) {
      where.source = source as string
    }
    if (appliedJobId) {
      where.appliedJobId = appliedJobId as string
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { position: { contains: search as string } },
      ]
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        appliedJob: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      data: candidates.map(serializeCandidate),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get candidates error:', error)
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
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        appliedJob: true,
        interviews: {
          include: {
            job: true,
            interviewers: true,
            evaluations: true,
          },
        },
        evaluations: {
          include: {
            interviewer: true,
          },
        },
        statusLogs: {
          include: {
            operator: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!candidate) {
      res.status(404).json({
        data: null,
        message: '候选人不存在',
        code: 404,
      })
      return
    }

    res.json({
      data: serializeCandidate(candidate),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get candidate error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, position, experience, education, skills, resumeUrl, status, source, rating, appliedJobId } = req.body

    if (!name || !email || !phone || !position) {
      res.status(400).json({
        data: null,
        message: '请填写必填字段',
        code: 400,
      })
      return
    }

    const skillsStr = Array.isArray(skills) ? skills.join(',') : skills

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone,
        position,
        experience: experience || 0,
        education,
        skills: skillsStr || '',
        resumeUrl,
        status: status || 'NEW',
        source,
        rating: rating || 0,
        appliedJobId,
      },
      include: {
        appliedJob: true,
      },
    })

    if (req.user) {
      await prisma.statusLog.create({
        data: {
          candidateId: candidate.id,
          fromStatus: null,
          toStatus: candidate.status,
          operatorId: req.user.userId,
          note: '创建候选人',
        },
      })
    }

    res.json({
      data: serializeCandidate(candidate),
      message: '创建成功',
      code: 200,
    })
  } catch (error) {
    console.error('Create candidate error:', error)
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
    const { name, email, phone, position, experience, education, skills, resumeUrl, source, rating, appliedJobId } = req.body

    const data: any = {}
    if (name) data.name = name
    if (email) data.email = email
    if (phone) data.phone = phone
    if (position) data.position = position
    if (experience !== undefined) data.experience = experience
    if (education !== undefined) data.education = education
    if (skills !== undefined) {
      data.skills = Array.isArray(skills) ? skills.join(',') : skills
    }
    if (resumeUrl !== undefined) data.resumeUrl = resumeUrl
    if (source !== undefined) data.source = source
    if (rating !== undefined) data.rating = rating
    if (appliedJobId !== undefined) data.appliedJobId = appliedJobId

    const candidate = await prisma.candidate.update({
      where: { id },
      data,
      include: {
        appliedJob: true,
      },
    })

    res.json({
      data: serializeCandidate(candidate),
      message: '更新成功',
      code: 200,
    })
  } catch (error) {
    console.error('Update candidate error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status, note } = req.body

    if (!status) {
      res.status(400).json({
        data: null,
        message: '请提供状态',
        code: 400,
      })
      return
    }

    if (!req.user) {
      res.status(401).json({
        data: null,
        message: '未认证',
        code: 401,
      })
      return
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id },
    })

    if (!candidate) {
      res.status(404).json({
        data: null,
        message: '候选人不存在',
        code: 404,
      })
      return
    }

    const fromStatus = candidate.status

    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: { status },
      include: {
        appliedJob: true,
      },
    })

    await prisma.statusLog.create({
      data: {
        candidateId: id,
        fromStatus,
        toStatus: status,
        operatorId: req.user.userId,
        note,
      },
    })

    res.json({
      data: serializeCandidate(updatedCandidate),
      message: '状态更新成功',
      code: 200,
    })
  } catch (error) {
    console.error('Update candidate status error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.get('/:id/status-logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const logs = await prisma.statusLog.findMany({
      where: { candidateId: id },
      include: { operator: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      data: logs.map(serializeStatusLog),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get status logs error:', error)
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
    await prisma.candidate.delete({ where: { id } })

    res.json({
      data: null,
      message: '删除成功',
      code: 200,
    })
  } catch (error) {
    console.error('Delete candidate error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

export default router
