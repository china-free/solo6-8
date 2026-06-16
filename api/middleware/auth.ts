import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from '../lib/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      data: null,
      message: '未提供认证令牌',
      code: 401,
    })
    return
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)

  if (!payload) {
    res.status(401).json({
      data: null,
      message: '认证令牌无效或已过期',
      code: 401,
    })
    return
  }

  req.user = payload
  next()
}

export function requireRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        data: null,
        message: '未认证',
        code: 401,
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        data: null,
        message: '权限不足',
        code: 403,
      })
      return
    }

    next()
  }
}
