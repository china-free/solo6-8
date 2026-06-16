import { Router, type Request, type Response } from 'express'
import prisma from '../prisma.js'
import { authMiddleware, requireRoles } from '../middleware/auth.js'
import { serializeJob } from '../lib/serializers.js'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, department } = req.query
    const where: any = {}

    if (status) {
      where.status = status as string
    }
    if (department) {
      where.department = department as string
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        hiringManager: true,
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      data: jobs.map(serializeJob),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get jobs error:', error)
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
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        hiringManager: true,
        _count: { select: { candidates: true } },
      },
    })

    if (!job) {
      res.status(404).json({
        data: null,
        message: '职位不存在',
        code: 404,
      })
      return
    }

    res.json({
      data: serializeJob(job),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.post('/', requireRoles(['ADMIN', 'HR', 'HIRING_MANAGER']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, department, description, requirements, salaryRange, location, status, hiringManagerId } = req.body

    if (!title || !department || !description || !requirements || !location || !hiringManagerId) {
      res.status(400).json({
        data: null,
        message: '请填写必填字段',
        code: 400,
      })
      return
    }

    const job = await prisma.job.create({
      data: {
        title,
        department,
        description,
        requirements,
        salaryRange,
        location,
        status: status || 'DRAFT',
        hiringManagerId,
      },
      include: {
        hiringManager: true,
        _count: { select: { candidates: true } },
      },
    })

    res.json({
      data: serializeJob(job),
      message: '创建成功',
      code: 200,
    })
  } catch (error) {
    console.error('Create job error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.put('/:id', requireRoles(['ADMIN', 'HR', 'HIRING_MANAGER']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, department, description, requirements, salaryRange, location, status, hiringManagerId } = req.body

    const data: any = {}
    if (title) data.title = title
    if (department) data.department = department
    if (description) data.description = description
    if (requirements) data.requirements = requirements
    if (salaryRange !== undefined) data.salaryRange = salaryRange
    if (location) data.location = location
    if (status) data.status = status
    if (hiringManagerId) data.hiringManagerId = hiringManagerId

    const job = await prisma.job.update({
      where: { id },
      data,
      include: {
        hiringManager: true,
        _count: { select: { candidates: true } },
      },
    })

    res.json({
      data: serializeJob(job),
      message: '更新成功',
      code: 200,
    })
  } catch (error) {
    console.error('Update job error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.delete('/:id', requireRoles(['ADMIN', 'HR']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.job.delete({ where: { id } })

    res.json({
      data: null,
      message: '删除成功',
      code: 200,
    })
  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

export default router
