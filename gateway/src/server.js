import { createApp } from './app.js'
import { serviceUrlsFromEnv } from './routes.js'

const port = Number(process.env.GATEWAY_PORT ?? 4000)

createApp(serviceUrlsFromEnv()).listen(port, () => {
	console.log(`gateway listening on http://localhost:${port}`)
})
