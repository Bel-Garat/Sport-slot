import assert from 'node:assert/strict'
import { test } from 'node:test'
import express from 'express'
import request from 'supertest'
import { AppError, errorHandler, invalidDtoIn, notAuthorized, notFound, unsupportedKeys } from '../src/index.js'

function createApp() {
	const app = express()
	app.use(express.json())
	app.get('/venue/get', (req, res) => {
		if (!req.query.id) throw invalidDtoIn({ missingKeyMap: { id: 'Klíč id je povinný.' } })
		if (req.query.id === 'missing') {
			throw new AppError('venueDoesNotExist', 'Sportoviště nenalezeno.', 404, { id: req.query.id })
		}
		res.json({ id: req.query.id, uuAppErrorMap: unsupportedKeys(req, req.query, ['id']) })
	})
	app.post('/venue/create', () => {
		throw notAuthorized()
	})
	app.get('/venue/crash', () => {
		throw new Error('db password in stack trace')
	})
	app.use(notFound)
	app.use(errorHandler)
	return app
}

test('success has dtoOut and an empty uuAppErrorMap', async () => {
	const response = await request(createApp()).get('/venue/get?id=1')
	assert.equal(response.status, 200)
	assert.deepEqual(response.body, { id: '1', uuAppErrorMap: {} })
})

test('extra keys still succeed but carry an unsupportedKeys warning', async () => {
	const response = await request(createApp()).get('/venue/get?id=1&foo=x&bar=y')
	assert.equal(response.status, 200)
	assert.deepEqual(response.body.uuAppErrorMap, {
		'venue/get/unsupportedKeys': {
			type: 'warning',
			message: 'Vstupní data obsahují nepodporované klíče.',
			paramMap: { unsupportedKeyList: ['foo', 'bar'] },
		},
	})
})

test('invalidDtoIn is 400 with all three key maps', async () => {
	const response = await request(createApp()).get('/venue/get')
	assert.equal(response.status, 400)
	assert.deepEqual(response.body, {
		uuAppErrorMap: {
			'venue/get/invalidDtoIn': {
				type: 'error',
				message: 'Vstupní data nejsou platná.',
				paramMap: { invalidTypeKeyMap: {}, invalidValueKeyMap: {}, missingKeyMap: { id: 'Klíč id je povinný.' } },
			},
		},
	})
})

test('AppError keeps its status, code and paramMap', async () => {
	const response = await request(createApp()).get('/venue/get?id=missing')
	assert.equal(response.status, 404)
	assert.deepEqual(response.body.uuAppErrorMap['venue/get/venueDoesNotExist'], {
		type: 'error',
		message: 'Sportoviště nenalezeno.',
		paramMap: { id: 'missing' },
	})
})

test('notAuthorized is 403 "Nemáte oprávnění."', async () => {
	const response = await request(createApp()).post('/venue/create')
	assert.equal(response.status, 403)
	assert.equal(response.body.uuAppErrorMap['venue/create/notAuthorized'].message, 'Nemáte oprávnění.')
})

test('malformed JSON body is 400 invalidDtoIn', async () => {
	const response = await request(createApp())
		.post('/venue/create')
		.set('Content-Type', 'application/json')
		.send('{"name":')
	assert.equal(response.status, 400)
	assert.ok(response.body.uuAppErrorMap['venue/create/invalidDtoIn'])
})

test('unexpected errors are 500 and do not leak the internal message', async (t) => {
	t.mock.method(console, 'error', () => {})
	const response = await request(createApp()).get('/venue/crash')
	assert.equal(response.status, 500)
	assert.deepEqual(response.body.uuAppErrorMap['venue/crash/unexpectedError'], {
		type: 'error',
		message: 'Neočekávaná chyba serveru.',
		paramMap: {},
	})
	assert.doesNotMatch(JSON.stringify(response.body), /password/)
})

test('unknown command is 404 unknownCommand, also behind the /api prefix', async () => {
	const response = await request(createApp()).get('/api/foo/bar')
	assert.equal(response.status, 404)
	assert.ok(response.body.uuAppErrorMap['foo/bar/unknownCommand'])
})

test('commands inside a mounted router keep their full name', async () => {
	const app = express()
	const router = express.Router()
	router.get('/list', (req, res) => {
		res.json({ uuAppErrorMap: unsupportedKeys(req, req.query, []) })
	})
	router.get('/get', () => {
		throw notAuthorized()
	})
	app.use('/court', router)
	app.use(errorHandler)

	const warning = await request(app).get('/court/list?foo=1')
	assert.ok(warning.body.uuAppErrorMap['court/list/unsupportedKeys'])

	const error = await request(app).get('/court/get')
	assert.ok(error.body.uuAppErrorMap['court/get/notAuthorized'])
})
