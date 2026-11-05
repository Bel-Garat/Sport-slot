import {
  notAuthenticated,
  notAuthorized,
} from '@sportslot/api-format'

export function requireRole(requiredRole) {
  return function authorize(req, res, next) {
    if (!req.auth) {
      return next(notAuthenticated())
    }

    if (!req.auth.roles.includes(requiredRole)) {
      return next(notAuthorized())
    }

    next()
  }
}
