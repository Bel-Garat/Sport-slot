import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose'
import { createGoogleTokenVerifier } from '../src/googleToken.js'

const CLIENT_ID = 'sportslot-test.apps.googleusercontent.com'
const { publicKey, privateKey } = await generateKeyPair('RS256')
const keySet = createLocalJWKSet({ keys: [{ ...(await exportJWK(publicKey)), kid: 'test', alg: 'RS256' }] })
const verify = createGoogleTokenVerifier(CLIENT_ID, keySet)

function googleToken(claims, { issuer = 'https://accounts.google.com', audience = CLIENT_ID } = {}) {
	return new SignJWT({ email: 'player@example.com', email_verified: true, name: 'Petr Hráč', ...claims })
		.setProtectedHeader({ alg: 'RS256', kid: 'test' })
		.setSubject('google-123')
		.setIssuer(issuer)
		.setAudience(audience)
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(privateKey)
}

test('accepts a Google ID token for this client', async () => {
	assert.deepEqual(await verify(await googleToken({})), {
		googleId: 'google-123',
		email: 'player@example.com',
		name: 'Petr Hráč',
	})
})

test('rejects a token issued for another client', async () => {
	await assert.rejects(verify(await googleToken({}, { audience: 'someone-else' })))
})

test('rejects a token from another issuer', async () => {
	await assert.rejects(verify(await googleToken({}, { issuer: 'https://evil.example.com' })))
})

test('rejects an unverified e-mail', async () => {
	await assert.rejects(verify(await googleToken({ email_verified: false })))
})

test('falls back to the e-mail when Google sends no name', async () => {
	const user = await verify(await googleToken({ name: undefined }))
	assert.equal(user.name, 'player@example.com')
})
