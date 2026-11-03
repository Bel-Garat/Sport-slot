import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url'
import { routes } from './routes.js'

// Nastavení __dirname pro ES Moduly
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createApp(serviceUrls) {
  const app = express()

  // Načtení OpenAPI specifikace
  const openapiDocument = YAML.load(path.join(__dirname, '../../docs/openapi.yaml'))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'gateway' })
  })

  // Swagger UI (musí být před 404 handlerem)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument))

  for (const { prefix, service } of routes) {
    app.use(
      createProxyMiddleware({
        target: serviceUrls[service],
        pathFilter: (path) => path === prefix || path.startsWith(`${prefix}/`),
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
      }),
    )
  }

  // 404 catch-all handler musí být na úplném konci
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}