export function requireRole(requiredRole) {
  return function authorize(req, res, next) {
    if (!req.auth) {
      return res.status(401).json({
        code: 'notAuthenticated',
        message: 'Authentication required',
        params: {},
      })
    }

    if (!req.auth.roles.includes(requiredRole)) {
      return res.status(403).json({
        code: 'notAuthorized',
        message: 'Nemáte oprávnění',
        params: {},
      })
    }

    next()
  }
}
