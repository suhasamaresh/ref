const requestLogger = (req: any, res: any, next: any) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
	next();
};

module.exports = { requestLogger };
