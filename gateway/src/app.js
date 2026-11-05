
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { routes } from './routes.js'
import { createAuthMiddleware } from './middleware/auth.js'
import { requireRole } from './middleware/roles.js'

const PUBLIC_ENDPOINTS = new Set([
  'POST /api/auth/googleCallback',
  'GET /api/venue/list',
  'GET /api/venue/get',
  'GET /api/court/list',
  'GET /api/priceRule/listByCourt',
  'GET /api/review/listByVenue',
])

const MANAGER_ENDPOINTS = new Set([
  'POST /api/venue/create',
  'POST /api/court/create',
  'POST /api/priceRule/create',
])

export function createApp(
  serviceUrls,
  { jwtSecret = process.env.JWT_SECRET } = {},
) {
  const app = express()

  const authenticate = jwtSecret
    ? createAuthMiddleware(jwtSecret)
    : null

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'gateway' })
  })

  // Authentication and role protection
  app.use((req, res, next) => {
    const path = req.path
    const endpoint = `${req.method} ${path}`

    const isServiceRoute = routes.some(
      ({ prefix }) =>
        path === prefix || path.startsWith(`${prefix}/`),
    )

    if (!isServiceRoute) {
      return next()
    }

    delete req.headers['x-user-id']
    delete req.headers['x-user-roles']
    delete req.headers['x-gateway-secret']

    if (PUBLIC_ENDPOINTS.has(endpoint)) {
      return next()
    }

    if (!authenticate) {
      return res.status(503).json({
        code: 'authUnavailable',
        message: 'Authentication is not configured',
        params: {},
      })
    }

    authenticate(req, res, () => {
      if (MANAGER_ENDPOINTS.has(endpoint)) {
        return requireRole('MANAGER')(req, res, next)
      }

      return next()
    })
  })

  // Forward requests to backend services
  for (const { prefix, service } of routes) {
    app.use(
      createProxyMiddleware({
        target: serviceUrls[service],
        pathFilter: (path) =>
          path === prefix || path.startsWith(`${prefix}/`),
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
      }),
    )
  }

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
