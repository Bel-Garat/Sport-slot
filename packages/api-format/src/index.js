// Společný formát odpovědí a chyb (viz docs/api.md, kap. "Formát odpovědí a chyb").
// Každá odpověď nese uuAppErrorMap: { "<command>/<kód>": { type, message, paramMap } }.

// Chyba vyhozená v routě. Klíč "<command>/<kód>" doplní errorHandler podle URL.
export class AppError extends Error {
	constructor(code, message, status = 400, paramMap = {}) {
		super(message)
		this.code = code
		this.status = status
		this.paramMap = paramMap
	}
}

export function invalidDtoIn({ invalidTypeKeyMap = {}, invalidValueKeyMap = {}, missingKeyMap = {} } = {}) {
	return new AppError('invalidDtoIn', 'Vstupní data nejsou platná.', 400, {
		invalidTypeKeyMap,
		invalidValueKeyMap,
		missingKeyMap,
	})
}

export function notAuthenticated() {
	return new AppError('notAuthenticated', 'Nejste přihlášen.', 401)
}

export function notAuthorized() {
	return new AppError('notAuthorized', 'Nemáte oprávnění.', 403)
}

// "/api/venue/get" i "/venue/get" -> "venue/get"
export function commandOf(req) {
	return req.path.replace(/^\/(api\/)?/, '').replace(/\/$/, '')
}

// Varování unsupportedKeys pro úspěšnou odpověď; bez cizích klíčů vrací {}.
// Použití: res.json({ ...dtoOut, uuAppErrorMap: unsupportedKeys(req, dtoIn, ['id']) })
export function unsupportedKeys(req, dtoIn, allowedKeys) {
	const unsupportedKeyList = Object.keys(dtoIn).filter((key) => !allowedKeys.includes(key))
	if (unsupportedKeyList.length === 0) return {}
	return {
		[`${commandOf(req)}/unsupportedKeys`]: {
			type: 'warning',
			message: 'Vstupní data obsahují nepodporované klíče.',
			paramMap: { unsupportedKeyList },
		},
	}
}

function sendError(req, res, status, code, message, paramMap) {
	res.status(status).json({
		uuAppErrorMap: { [`${commandOf(req)}/${code}`]: { type: 'error', message, paramMap } },
	})
}

// Zařadit za všechny routy: app.use(notFound)
export function notFound(req, res) {
	sendError(req, res, 404, 'unknownCommand', 'Neznámý příkaz.', {})
}

// Zařadit úplně na konec: app.use(errorHandler)
// eslint-disable-next-line no-unused-vars -- Express pozná error handler podle 4 parametrů
export function errorHandler(err, req, res, next) {
	if (err instanceof AppError) {
		return sendError(req, res, err.status, err.code, err.message, err.paramMap)
	}
	// Chyby z express.json() (nevalidní JSON, příliš velké tělo) mají expose = true a status 4xx.
	if (err.expose && err.status >= 400 && err.status < 500) {
		return sendError(req, res, err.status, 'invalidDtoIn', 'Vstupní data nejsou platná.', {})
	}
	console.error(err)
	// Detaily neočekávané chyby se klientovi neposílají, jen do logu.
	sendError(req, res, 500, 'unexpectedError', 'Neočekávaná chyba serveru.', {})
}
