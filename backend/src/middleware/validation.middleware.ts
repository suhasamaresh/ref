// Simple validation middleware placeholder. Real validators can be plugged in.
const validate = (schema?: any) => (req: any, res: any, next: any) => {
	// If schema is provided, run validation here. For now, always pass-through.
	next();
};

module.exports = { validate };
