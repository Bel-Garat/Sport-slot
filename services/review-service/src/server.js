import { createApp } from './app.js'

const port = Number(process.env.REVIEW_SERVICE_PORT ?? 4004)

createApp().listen(port, () => {
	console.log(`review-service listening on http://localhost:${port}`)
})
