import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { jwtVerify } from 'jose'
import { createApp } from '../src/app.js'
import { TOKEN_LIFETIME_SECONDS } from '../src/token.js'

const JWT_SECRET = 'test-jwt-secret-with-at-least-32-characters'
const GATEWAY_SECRET = 'test-gateway-secret-at-least-32-characters'
const USER = {
	id: '00000000-0000-4000-8000-000000000001',
	email: 'samir@example.com',
	name: 'Samir Obeidat',
	roles: ['PLAYER', 'MANAGER'],
}

function createTestApp(overrides = {}) {
	const upserts = []
	const app = createApp({
		jwtSecret: JWT_SECRET,
		gatewaySecret: GATEWAY_SECRET,
		verifyGoogleIdToken: async (idToken) => {
			if (idToken !== 'valid-google-token') throw new Error('invalid')
			return { googleId: 'google-123', email: USER.email, name: USER.name }
		},
		userDao: {
			upsertByGoogleId: async (googleUser) => {
				upserts.push(googleUser)
				return USER
			},
			get: async (id) => (id === USER.id ? USER : null),
		},
		...overrides,
	})
	return { app, upserts }
}

test('POST /auth/googleCallback signs in and returns an application token', async () => {
	const { app, upserts } = createTestApp()

	const response = await request(app).post('/auth/googleCallback').send({ idToken: 'valid-google-token' })

	assert.equal(response.status, 200)
	assert.deepEqual(response.body.user, USER)
	assert.deepEqual(response.body.uuAppErrorMap, {})
	assert.deepEqual(upserts, [{ googleId: 'google-123', email: USER.email, name: USER.name }])

	const { payload, protectedHeader } = await jwtVerify(response.body.token, new TextEncoder().encode(JWT_SECRET))
	assert.equal(protectedHeader.alg, 'HS256')
	assert.equal(payload.userId, USER.id)
	assert.deepEqual(payload.roles, USER.roles)
	assert.equal(payload.exp - payload.iat, TOKEN_LIFETIME_SECONDS)
})

test('POST /auth/googleCallback answers 401 for a token Google did not issue', async () => {
	const { app, upserts } = createTestApp()

	const response = await request(app).post('/auth/googleCallback').send({ idToken: 'forged' })

	assert.equal(response.status, 401)
	assert.ok(response.body.uuAppErrorMap['auth/googleCallback/invalidGoogleToken'])
	assert.equal(upserts.length, 0)
})

test('POST /auth/googleCallback validates dtoIn', async () => {
	const { app } = createTestApp()

	const missing = await request(app).post('/auth/googleCallback').send({})
	assert.equal(missing.status, 400)
	assert.ok(missing.body.uuAppErrorMap['auth/googleCallback/invalidDtoIn'].paramMap.missingKeyMap.idToken)

	const wrongType = await request(app).post('/auth/googleCallback').send({ idToken: 42 })
	assert.equal(wrongType.status, 400)
	assert.ok(wrongType.body.uuAppErrorMap['auth/googleCallback/invalidDtoIn'].paramMap.invalidTypeKeyMap.idToken)
})

test('POST /auth/googleCallback answers 503 when Google login is not configured', async () => {
	const { app } = createTestApp({ verifyGoogleIdToken: undefined })

	const response = await request(app).post('/auth/googleCallback').send({ idToken: 'valid-google-token' })

	assert.equal(response.status, 503)
	assert.ok(response.body.uuAppErrorMap['auth/googleCallback/googleLoginUnavailable'])
})

test('GET /user/me returns the user forwarded by the gateway', async () => {
	const { app } = createTestApp()

	const response = await request(app)
		.get('/user/me')
		.set({ 'x-gateway-secret': GATEWAY_SECRET, 'x-user-id': USER.id })

	assert.equal(response.status, 200)
	assert.deepEqual(response.body, { ...USER, uuAppErrorMap: {} })
})

test('GET /user/me rejects requests that bypass the gateway', async () => {
	const { app } = createTestApp()

	const response = await request(app).get('/user/me').set({ 'x-user-id': USER.id })

	assert.equal(response.status, 401)
	assert.ok(response.body.uuAppErrorMap['user/me/notAuthenticated'])
})

test('GET /user/me answers 404 for a deleted user', async () => {
	const { app } = createTestApp()

	const response = await request(app)
		.get('/user/me')
		.set({ 'x-gateway-secret': GATEWAY_SECRET, 'x-user-id': '00000000-0000-4000-8000-000000000999' })

	assert.equal(response.status, 404)
	assert.ok(response.body.uuAppErrorMap['user/me/userDoesNotExist'])
})
