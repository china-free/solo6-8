import { Router, type Request, type Response } from 'express'
import prisma from '../prisma.js'
import { comparePassword } from '../lib/password.js'
import { generateToken } from '../lib/jwt.js'
import { authMiddleware } from '../middleware/auth.js'
import { serializeUser } from '../lib/serializers.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({
        data: null,
        message: '请输入邮箱和密码',
        code: 400,
      })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      res.status(401).json({
        data: null,
        message: '邮箱或密码错误',
        code: 401,
      })
      return
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      res.status(401).json({
        data: null,
        message: '邮箱或密码错误',
        code: 401,
      })
      return
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })

    res.json({
      data: {
        token,
        user: serializeUser(user),
      },
      message: '登录成功',
      code: 200,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        data: null,
        message: '未认证',
        code: 401,
      })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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
    console.error('Get me error:', error)
    res.status(500).json({
      data: null,
      message: '服务器内部错误',
      code: 500,
    })
  }
})

export default router
