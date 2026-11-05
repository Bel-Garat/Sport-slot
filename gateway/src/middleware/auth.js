
import { jwtVerify } from 'jose'

const ALLOWED_ROLES = ['PLAYER', 'MANAGER', 'ADMIN']
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createAuthMiddleware(jwtSecret) {
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters')
  }

  const secretKey = new TextEncoder().encode(jwtSecret)

  return async function authenticate(req, res, next) {
    const authorization = req.get('authorization')

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 'notAuthenticated',
        message: 'Missing or invalid authorization header',
        params: {},
      })
    }

    const token = authorization.slice(7)

    try {
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256'],
      })

      const validUserId =
        typeof payload.userId === 'string' &&
        UUID_PATTERN.test(payload.userId)

      const validRoles =
        Array.isArray(payload.roles) &&
        payload.roles.includes('PLAYER') &&
        payload.roles.every((role) => ALLOWED_ROLES.includes(role))

      const validLifetime =
        Number.isSafeInteger(payload.iat) &&
        Number.isSafeInteger(payload.exp) &&
        payload.exp > payload.iat &&
        payload.exp - payload.iat <= 86400

      if (!validUserId || !validRoles || !validLifetime) {
        throw new Error('Invalid token payload')
      }

      req.auth = {
        userId: payload.userId,
        roles: payload.roles,
      }

      next()
    } catch {
      return res.status(401).json({
        code: 'notAuthenticated',
        message: 'Invalid or expired token',
        params: {},
      })
    }
  }
}
