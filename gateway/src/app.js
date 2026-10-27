import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { routes } from './routes.js'

export function createApp(serviceUrls) {
	const app = express()
	app.get('/health', (_req, res) => {
		res.json({ status: 'ok', service: 'gateway' })
	})
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
	app.use((_req, res) => {
		res.status(404).json({ error: 'Not found' })
	})
	return app
}
