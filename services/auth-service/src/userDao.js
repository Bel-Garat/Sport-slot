const USER_SELECT = { id: true, email: true, name: true, roles: true }

export function createUserDao(db) {
	return {
		upsertByGoogleId({ googleId, email, name }) {
			return db.user.upsert({
				where: { googleId },
				create: { googleId, email, name },
				update: { email, name },
				select: USER_SELECT,
			})
		},

		get(id) {
			return db.user.findUnique({ where: { id }, select: USER_SELECT })
		},
	}
}
