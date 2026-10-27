import { createApp } from './app.js'

const port = Number(process.env.VENUE_SERVICE_PORT ?? 4002)

createApp().listen(port, () => {
	console.log(`venue-service listening on http://localhost:${port}`)
})
