import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { createApp } from '../src/app.js'

test('GET /health reports the service as up', async () => {
	const response = await request(createApp()).get('/health')
	assert.equal(response.status, 200)
	assert.deepEqual(response.body, { status: 'ok', service: 'reservation-service' })
})
