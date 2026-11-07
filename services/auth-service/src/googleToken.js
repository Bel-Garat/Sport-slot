import { createRemoteJWKSet, jwtVerify } from 'jose'

const GOOGLE_CERTS_URL = new URL('https://www.googleapis.com/oauth2/v3/certs')
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com']

export function createGoogleTokenVerifier(clientId, keySet = createRemoteJWKSet(GOOGLE_CERTS_URL)) {
	return async function verifyGoogleIdToken(idToken) {
		const { payload } = await jwtVerify(idToken, keySet, {
			issuer: GOOGLE_ISSUERS,
			audience: clientId,
		})

		if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || payload.email_verified !== true) {
			throw new Error('Google token without a verified e-mail')
		}

		return {
			googleId: payload.sub,
			email: payload.email,
			name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : payload.email,
		}
	}
}
