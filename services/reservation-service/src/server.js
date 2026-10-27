import { createApp } from './app.js'

const port = Number(process.env.RESERVATION_SERVICE_PORT ?? 4003)

createApp().listen(port, () => {
	console.log(`reservation-service listening on http://localhost:${port}`)
})
