import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import express from 'express'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { serviceUrlsFromEnv } from '../src/routes.js'

const TEST_CONFIG = {
  gatewaySecret: 'test-gateway-secret-at-least-32-characters',
}

let venueService
let serviceUrls

before(async () => {
	const venue = express()
	venue.get('/venue/list', (_req, res) => res.json({ handledBy: 'venue-service' }))
	venueService = await new Promise((resolve) => {
		const server = venue.listen(0, () => resolve(server))
	})
	serviceUrls = { ...serviceUrlsFromEnv({}), venue: `http://localhost:${venueService.address().port}` }
})

after(() => venueService.close())

test('GET /health reports the gateway as up', async () => {
	const response = await request(createApp(serviceUrls, TEST_CONFIG)).get('/health')
	assert.equal(response.status, 200)
	assert.deepEqual(response.body, { status: 'ok', service: 'gateway' })
})

test('GET /api-docs/ serves the Swagger UI', async () => {
	const response = await request(createApp(serviceUrls, TEST_CONFIG)).get('/api-docs/')
	assert.equal(response.status, 200)
	assert.match(response.headers['content-type'], /text\/html/)
	assert.match(response.text, /swagger-ui/)
})

test('forwards /api/venue requests to the venue service without the /api prefix', async () => {
	const response = await request(createApp(serviceUrls, TEST_CONFIG)).get('/api/venue/list')
	assert.equal(response.status, 200)
	assert.deepEqual(response.body, { handledBy: 'venue-service' })
})

test('answers 404 for paths no service owns', async () => {
	const response = await request(createApp(serviceUrls, TEST_CONFIG)).get('/api/unknown')
	assert.equal(response.status, 404)
	assert.equal(response.body.uuAppErrorMap['unknown/unknownCommand'].type, 'error')
})
