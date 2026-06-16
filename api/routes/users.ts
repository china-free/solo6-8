import { Router, type Request, type Response } from 'express'
import prisma from '../prisma.js'
import { authMiddleware, requireRoles } from '../middleware/auth.js'
import { hashPassword } from '../lib/password.js'
import { serializeUser } from '../lib/serializers.js'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query
    const where: any = {}

    if (role) {
      where.role = role as string
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      data: users.map(serializeUser),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get users error:', error)
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
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      res.status(404).json({
        data: null,
        message: '用户不存在',
        code: 404,
      })
      return
    }

    res.json({
      data: serializeUser(user),
      message: '获取成功',
      code: 200,
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.post('/', requireRoles(['ADMIN', 'HR']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department, avatarUrl } = req.body

    if (!name || !email || !password || !role) {
      res.status(400).json({
        data: null,
        message: '请填写必填字段',
        code: 400,
      })
      return
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      res.status(400).json({
        data: null,
        message: '邮箱已被使用',
        code: 400,
      })
      return
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        department,
        avatarUrl,
      },
    })

    res.json({
      data: serializeUser(user),
      message: '创建成功',
      code: 200,
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.put('/:id', requireRoles(['ADMIN', 'HR']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, email, role, department, avatarUrl, password } = req.body

    const data: any = {}
    if (name) data.name = name
    if (email) data.email = email.toLowerCase()
    if (role) data.role = role
    if (department !== undefined) data.department = department
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl
    if (password) data.passwordHash = await hashPassword(password)

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    res.json({
      data: serializeUser(user),
      message: '更新成功',
      code: 200,
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.delete('/:id', requireRoles(['ADMIN']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.user.delete({ where: { id } })

    res.json({
      data: null,
      message: '删除成功',
      code: 200,
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

export default router
