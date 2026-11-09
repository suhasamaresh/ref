let multer: any;
try {
	multer = require('multer');
} catch (e) {
	multer = null;
}

let upload: any;
if (multer) {
	const storage = multer.memoryStorage();
	upload = multer({ storage });
} else {
	upload = {
		single: () => (req: any, res: any, next: any) => next(),
	};
}

module.exports = { upload };
