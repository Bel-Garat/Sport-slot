import express from 'express'
import { errorHandler, notFound } from '@sportslot/api-format'

export function createApp() {
	const app = express()
	app.use(express.json())
	app.get('/health', (_req, res) => {
		res.json({ status: 'ok', service: 'audit-service' })
	})
	app.use(notFound)
	app.use(errorHandler)
	return app
}
