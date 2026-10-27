import { createApp } from './app.js'

const port = Number(process.env.AUDIT_SERVICE_PORT ?? 4005)

createApp().listen(port, () => {
	console.log(`audit-service listening on http://localhost:${port}`)
})
