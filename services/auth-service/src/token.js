import { SignJWT } from 'jose'

export const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60

export function createTokenIssuer(jwtSecret) {
	const secretKey = new TextEncoder().encode(jwtSecret)

	return function issueToken(user) {
		return new SignJWT({ userId: user.id, roles: user.roles })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime(`${TOKEN_LIFETIME_SECONDS}s`)
			.sign(secretKey)
	}
}
