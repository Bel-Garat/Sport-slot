import { createApp } from './app.js'

const port = Number(process.env.AUTH_SERVICE_PORT ?? 4001)

createApp().listen(port, () => {
	console.log(`auth-service listening on http://localhost:${port}`)
})
