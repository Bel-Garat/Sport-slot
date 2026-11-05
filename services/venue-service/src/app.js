import express from 'express'
import { errorHandler, notFound } from '@sportslot/api-format'
import { getVenue, listVenues } from './venue.js'

// shortcut: server.js zatím venueDao nepředává (DB klient ještě není zapojený), venue/* do té doby vrací 500.
export function createApp({ venueDao } = {}) {
	const app = express()
	app.use(express.json())
	app.get('/health', (_req, res) => {
		res.json({ status: 'ok', service: 'venue-service' })
	})
	app.get('/venue/list', async (req, res) => {
		res.json(await listVenues(venueDao, req))
	})
	app.get('/venue/get', async (req, res) => {
		res.json(await getVenue(venueDao, req))
	})
	app.use(notFound)
	app.use(errorHandler)
	return app
}
