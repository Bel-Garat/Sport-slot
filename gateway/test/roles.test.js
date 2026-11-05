
import assert from 'node:assert/strict'
import { test } from 'node:test'
import express from 'express'
import request from 'supertest'
import { requireRole } from '../src/middleware/roles.js'

function createTestApp(roles) {
  const app = express()

  app.get(
    '/protected',
    (req, _res, next) => {
      if (roles) {
        req.auth = {
          userId: '10000000-0000-4000-8000-000000000001',
          roles,
        }
      }
      next()
    },
    requireRole('MANAGER'),
    (_req, res) => res.json({ success: true }),
  )

  return app
}

test('returns 401 for unauthenticated user', async () => {
  const response = await request(createTestApp()).get('/protected')

  assert.equal(response.status, 401)
  assert.equal(response.body.code, 'notAuthenticated')
})

test('returns 403 for PLAYER', async () => {
  const response = await request(
    createTestApp(['PLAYER']),
  ).get('/protected')

  assert.equal(response.status, 403)
  assert.equal(response.body.code, 'notAuthorized')
})

test('allows MANAGER to continue', async () => {
  const response = await request(
    createTestApp(['PLAYER', 'MANAGER']),
  ).get('/protected')

  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { success: true })
})

test('does not automatically grant MANAGER rights to ADMIN', async () => {
  const response = await request(
    createTestApp(['PLAYER', 'ADMIN']),
  ).get('/protected')

  assert.equal(response.status, 403)
})
