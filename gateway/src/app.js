
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
  {
    jwtSecret = process.env.JWT_SECRET,
    gatewaySecret = process.env.GATEWAY_SECRET,
    frontendOrigin = process.env.FRONTEND_ORIGIN,
  } = {},
) {
  const app = express()

  const authenticate = jwtSecret
    ? createAuthMiddleware(jwtSecret)
    : null

  // CORS for the frontend
  app.use((req, res, next) => {
    const origin = req.get('origin')

    if (origin) {
      res.vary('Origin')
    }

    if (origin && origin === frontendOrigin) {
      res.set('Access-Control-Allow-Origin', origin)
      res.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS',
      )
      res.set(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type',
      )
    }

    if (req.method === 'OPTIONS' && req.path.startsWith('/api/')) {
      if (!frontendOrigin || origin !== frontendOrigin) {
        return res.status(403).end()
      }

      return res.status(204).end()
    }

    next()
  })

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'gateway' })
  })

  // Authentication and authorization
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

    if (
      typeof gatewaySecret !== 'string' ||
      gatewaySecret.length < 32
    ) {
      return res.status(503).json({
        code: 'gatewayUnavailable',
        message: 'Gateway authentication is not configured',
        params: {},
      })
    }

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

  // Proxy verified requests to backend services
  for (const { prefix, service } of routes) {
    app.use(
      createProxyMiddleware({
        target: serviceUrls[service],
        pathFilter: (path) =>
          path === prefix || path.startsWith(`${prefix}/`),
        pathRewrite: { '^/api': '' },
        changeOrigin: true,

        on: {
          proxyReq(proxyReq, req) {
            // Remove any untrusted identity headers
            proxyReq.removeHeader('x-user-id')
            proxyReq.removeHeader('x-user-roles')
            proxyReq.removeHeader('x-gateway-secret')

            // Identify the trusted gateway to backend services
            proxyReq.setHeader('x-gateway-secret', gatewaySecret)

            // Forward identity only after successful JWT verification
            if (req.auth) {
              proxyReq.setHeader('x-user-id', req.auth.userId)
              proxyReq.setHeader(
                'x-user-roles',
                req.auth.roles.join(','),
              )
            }
          },
        },
      }),
    )
  }

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
